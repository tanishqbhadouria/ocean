"""
Script to build a 1-degree ocean graph in multiple chunks for better performance
This is a standalone script that builds and saves the graph for later use
"""
import os
import pickle
import time
import json
import networkx as nx
from math import radians, sin, cos, sqrt, atan2
from shapely.geometry import shape, Point
import numpy as np

# --- Constants ---
SPACING = 1.0  # 1-degree grid spacing
OUTPUT_FILE = 'ocean_graph_1deg.pkl'  # New output file name

def haversine(coord1, coord2):
    """
    Compute the Haversine distance between two [lon, lat] coordinates.
    Returns distance in kilometers.
    """
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0  # Earth radius in kilometers

    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def load_ocean_data(ocean_file_path):
    """Load ocean data from GeoJSON file"""
    print(f"Loading ocean data from {ocean_file_path}")
    
    with open(ocean_file_path, 'r') as f:
        ocean_data = json.load(f)
        
    # Check the type of the GeoJSON
    if ocean_data.get('type') == 'FeatureCollection':
        geometries = [feature['geometry'] for feature in ocean_data['features'] if feature.get('geometry')]
        print(f"Extracted {len(geometries)} geometries from FeatureCollection")
    elif ocean_data.get('type') == 'GeometryCollection':
        geometries = ocean_data.get('geometries', [])
        print(f"Extracted {len(geometries)} geometries from GeometryCollection")
    else:
        # If it's a single geometry, wrap it in a list
        geometries = [ocean_data.get('geometry', ocean_data)]
        print(f"Using single geometry")
    
    # Convert geometries to Shapely objects
    ocean_polygons = []
    for geom in geometries:
        if isinstance(geom, dict):
            try:
                polygon = shape(geom)
                ocean_polygons.append(polygon)
            except Exception as e:
                print(f"Error converting geometry to shape: {e}")
    
    print(f"Created {len(ocean_polygons)} Shapely polygons")
    return ocean_polygons

def load_shipping_lanes(shipping_lanes_file):
    """Load shipping lanes data from GeoJSON file"""
    print(f"Loading shipping lanes from {shipping_lanes_file}")
    
    with open(shipping_lanes_file, 'r') as f:
        lanes_data = json.load(f)
    
    lanes_geometries = []
    if lanes_data.get('type') == 'FeatureCollection':
        for feature in lanes_data['features']:
            if feature.get('geometry'):
                lanes_geometries.append(shape(feature['geometry']))
    
    print(f"Loaded {len(lanes_geometries)} shipping lanes")
    return lanes_geometries

def load_ports(ports_file):
    """Load ports data from GeoJSON file"""
    print(f"Loading ports from {ports_file}")
    
    with open(ports_file, 'r') as f:
        ports_data = json.load(f)
    
    ports = []
    if ports_data.get('type') == 'FeatureCollection':
        for feature in ports_data['features']:
            if feature.get('geometry'):
                coord = feature['geometry']['coordinates']
                name = feature['properties'].get('PORT_NAME', 'Unknown')
                ports.append({
                    'coordinates': coord,
                    'name': name,
                    'properties': feature['properties']
                })
    
    print(f"Loaded {len(ports)} ports")
    return ports

def is_valid_location(coord, ocean_polygons, shipping_lanes):
    """Check if a coordinate is in ocean or near shipping lanes"""
    pt = Point(coord)
    
    # Check if point is in ocean
    for poly in ocean_polygons:
        if poly.contains(pt):
            return True
            
    # Check if point is near shipping lanes (within ~5km buffer)
    for lane in shipping_lanes:
        if lane.distance(pt) < 0.05:  # Approximate 5km in degrees
            return True
            
    return False

def is_ocean(coord, ocean_polygons):
    """
    Check if a coordinate [lon, lat] is in the ocean.
    """
    try:
        pt = Point(coord)
        for poly in ocean_polygons:
            if poly.contains(pt):
                return True
        return False
    except Exception as e:
        print(f"Error in is_ocean: {e}")
        return True

def is_water_node(coord, ocean_polygons):
    """Check if a coordinate is in water"""
    try:
        pt = Point(coord)
        for poly in ocean_polygons:
            if poly.contains(pt):
                return True
        return False
    except Exception as e:
        print(f"Error checking water node: {e}")
        return False

def build_ocean_graph_chunk(ocean_polygons, shipping_lanes, ports, lat_min, lat_max, lon_min, lon_max, spacing, node_id_offset=0):
    """Build graph using only water nodes"""
    chunk_start_time = time.time()
    print(f"Building chunk: lat {lat_min} to {lat_max}, lon {lon_min} to {lon_max}")
    
    G = nx.Graph()
    node_id = node_id_offset
    ocean_count = 0
    total_points = 0
    
    # Create grid nodes within the chunk bounding box
    for lat in np.arange(lat_min, lat_max, spacing):
        for lon in np.arange(lon_min, lon_max, spacing):
            total_points += 1
            coord = (lon, lat)
            
            # Only add water nodes
            if is_water_node(coord, ocean_polygons):
                ocean_count += 1
                node_name = f'node_{node_id}'
                G.add_node(node_name, coordinates=coord, type='ocean')
                node_id += 1

    # Add ports as special nodes
    for port in ports:
        node_name = f'port_{port["name"].replace(" ", "_")}'
        G.add_node(node_name, coordinates=port['coordinates'], type='port', properties=port['properties'])
        node_id += 1
    
    node_time = time.time() - chunk_start_time
    print(f"Created {ocean_count} ocean nodes out of {total_points} grid points in {node_time:.2f}s")
    
    # Connect nodes within the chunk
    edge_start_time = time.time()
    nodes = list(G.nodes(data=True))
    edge_count = 0
    
    # Process nodes in batches for better progress reporting
    total_nodes = len(nodes)
    for i, (node1, data1) in enumerate(nodes):
        if i % 100 == 0:  # Progress reporting
            print(f"Processing edges: node {i}/{total_nodes}")
            
        coord1 = data1['coordinates']
        for node2, data2 in nodes[i+1:]:  # Only process each pair once
            coord2 = data2['coordinates']
            if abs(coord1[0] - coord2[0]) <= spacing * 1.1 and abs(coord1[1] - coord2[1]) <= spacing * 1.1:
                dist = haversine(coord1, coord2)
                G.add_edge(node1, node2, weight=dist)
                edge_count += 1
    
    edge_time = time.time() - edge_start_time
    chunk_time = time.time() - chunk_start_time
    print(f"Added {edge_count} edges in {edge_time:.2f}s")
    print(f"Chunk completed in {chunk_time:.2f}s: {G.number_of_nodes()} nodes, {edge_count} edges")
    return G

def build_1deg_graph(output_file=OUTPUT_FILE, ocean_file='converter/ocean.geojson', 
                    lanes_file='converter/Shipping_Lanes_v1.geojson', ports_file='converter/ports.geojson', spacing=SPACING):
    """Build a 1-degree ocean graph by processing the world in chunks"""
    start_time = time.time()
    
    print(f"Building {spacing}-degree ocean graph - output will be saved to {output_file}")
    
    # Check if output file already exists
    if os.path.exists(output_file):
        user_input = input(f"{output_file} already exists. Overwrite? (y/n): ")
        if user_input.lower() != 'y':
            print("Aborted.")
            return False
    
    # Load ocean data
    if not os.path.exists(ocean_file):
        print(f"Ocean file {ocean_file} not found!")
        return False
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    output_file = os.path.join('models', output_file)

    # Load all data sources
    ocean_polygons = load_ocean_data(ocean_file)
    shipping_lanes = load_shipping_lanes(lanes_file)
    ports = load_ports(ports_file)
    
    # Define smaller chunks for 1-degree processing to avoid memory issues
    chunks = []
    # Smaller chunks (20-degree) for finer resolution
    chunk_size = 20
    for lat_min in range(-60, 61, chunk_size):
        for lon_min in range(-120, 121, chunk_size):
            lat_max = min(lat_min + chunk_size, 61)
            lon_max = min(lon_min + chunk_size, 121)
            chunks.append((lat_min, lat_max, lon_min, lon_max))
    
    print(f"Processing in {len(chunks)} chunks...")
    
    # Build graph for each chunk
    chunk_graphs = []
    node_id_offset = 0
    
    for i, (lat_min, lat_max, lon_min, lon_max) in enumerate(chunks):
        print(f"Processing chunk {i+1}/{len(chunks)}")
        chunk_graph = build_ocean_graph_chunk(
            ocean_polygons, shipping_lanes, ports,
            lat_min, lat_max, lon_min, lon_max, 
            spacing=spacing, node_id_offset=node_id_offset
        )
        node_id_offset += chunk_graph.number_of_nodes()
        chunk_graphs.append(chunk_graph)
        
        # Save intermediate results every few chunks
        if (i+1) % 5 == 0:
            temp_file = f"{output_file}.temp{i+1}"
            print(f"Saving intermediate results to {temp_file}")
            try:
                with open(temp_file, 'wb') as f:
                    pickle.dump(chunk_graphs, f)
            except Exception as e:
                print(f"Warning: Failed to save intermediate results: {e}")
    
    # Merge all chunks into one graph
    print("\nMerging all chunks into one graph...")
    G = nx.Graph()
    for chunk_graph in chunk_graphs:
        G.add_nodes_from(chunk_graph.nodes(data=True))
        G.add_edges_from(chunk_graph.edges(data=True))
    
    print(f"Initial merge: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    print("Connecting nodes between chunks...")
    
    # Connect nodes at chunk boundaries - process in batches to reduce memory pressure
    nodes = list(G.nodes(data=True))
    total_nodes = len(nodes)
    boundary_edges = 0
    batch_size = 500
    
    for i in range(0, total_nodes, batch_size):
        batch_end = min(i + batch_size, total_nodes)
        print(f"Processing boundary connections: nodes {i}-{batch_end}/{total_nodes}")
        
        for j in range(i, batch_end):
            node1, data1 = nodes[j]
            coord1 = data1['coordinates']
            
            # Check only against nodes we haven't checked yet
            for k in range(j+1, total_nodes):
                node2, data2 = nodes[k]
                
                # Skip if already connected
                if G.has_edge(node1, node2):
                    continue
                    
                coord2 = data2['coordinates']
                # Check if nodes are close enough to be neighbors
                if abs(coord1[0] - coord2[0]) <= spacing * 1.1 and abs(coord1[1] - coord2[1]) <= spacing * 1.1:
                    dist = haversine(coord1, coord2)
                    G.add_edge(node1, node2, weight=dist)
                    boundary_edges += 1
    
    # Save the merged graph
    print(f"Added {boundary_edges} edges between chunk boundaries")
    print(f"Final graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    
    # Save the graph
    try:
        with open(output_file, 'wb') as f:
            stats = {
                'node_count': G.number_of_nodes(),
                'edge_count': G.number_of_edges(),
                'build_time': time.time() - start_time,
                'parameters': {
                    'lat_min': -60, 
                    'lat_max': 60,
                    'lon_min': -120, 
                    'lon_max': 120,
                    'spacing': spacing
                }
            }
            pickle.dump((G, stats), f)
        
        total_time = time.time() - start_time
        print(f"Graph saved to {output_file}")
        print(f"Total time: {total_time:.1f} seconds")
        return True
    except Exception as e:
        print(f"Error saving graph: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments for custom spacing
    if len(sys.argv) > 1:
        try:
            custom_spacing = float(sys.argv[1])
            print(f"Using custom spacing: {custom_spacing}°")
            output_file = f'ocean_graph_{custom_spacing}deg.pkl'
            build_1deg_graph(output_file=output_file, spacing=custom_spacing)
        except ValueError:
            print(f"Invalid spacing argument: {sys.argv[1]}. Using default: {SPACING}°")
            build_1deg_graph()
    else:
        # Use default 1-degree spacing
        print(f"Building ocean graph with {SPACING}° spacing")
        build_1deg_graph()
