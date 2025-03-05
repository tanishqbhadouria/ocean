"""
Utility to handle antimeridian (international date line) connections in ocean routing graphs
This ensures proper handling of routes that cross the ±180° longitude line
"""
import networkx as nx
from math import radians, sin, cos, sqrt, atan2

def haversine_with_wrap(coord1, coord2, wrap_threshold=180):
    """
    Calculate distance between points considering antimeridian wrapping.
    Returns distance in kilometers and whether route crosses antimeridian.
    """
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0  # Earth radius in kilometers

    # Normalize longitudes to -180 to +180 range
    lon1 = ((lon1 + 180) % 360) - 180
    lon2 = ((lon2 + 180) % 360) - 180

    # Check if route should wrap around antimeridian
    lon_diff = abs(lon1 - lon2)
    if lon_diff > wrap_threshold:
        # Calculate both direct and wrapped distances
        if lon1 < 0:
            wrapped_lon1 = lon1 + 360
            wrapped_lon2 = lon2
        else:
            wrapped_lon1 = lon1
            wrapped_lon2 = lon2 + 360
        
        # Use wrapped coordinates
        lon1, lon2 = wrapped_lon1, wrapped_lon2
    
    # Convert coordinates to radians
    lat1, lat2 = radians(lat1), radians(lat2)
    lon1, lon2 = radians(lon1), radians(lon2)
    
    # Haversine formula with error checking
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Use more stable formula for small distances
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    
    # Clamp 'a' to valid range for asin
    a = max(0.0, min(1.0, a))
    
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    crosses_antimeridian = lon_diff > wrap_threshold
    return distance, crosses_antimeridian

def connect_across_antimeridian(G, buffer_degrees=5.0, max_lat_diff=2.0):
    """
    Add edges between nodes on either side of the antimeridian (±180°).
    
    Args:
        G: NetworkX graph
        buffer_degrees: How close to ±180° to look for nodes
        max_lat_diff: Maximum latitude difference for connecting nodes
        
    Returns:
        Modified graph with antimeridian connections
    """
    print("Adding antimeridian crossing connections...")
    
    # Find nodes near the antimeridian
    west_nodes = []  # Nodes near -180°
    east_nodes = []  # Nodes near +180°
    
    for node, data in G.nodes(data=True):
        if 'coordinates' not in data:
            continue
            
        lon = data['coordinates'][0]
        if -180 <= lon <= -180 + buffer_degrees:
            west_nodes.append((node, data))
        elif 180 - buffer_degrees <= lon <= 180:
            east_nodes.append((node, data))
    
    print(f"Found {len(west_nodes)} western and {len(east_nodes)} eastern nodes near antimeridian")
    
    # Connect matching nodes across the antimeridian
    edges_added = 0
    
    for west_node, west_data in west_nodes:
        west_lon, west_lat = west_data['coordinates']
        
        for east_node, east_data in east_nodes:
            east_lon, east_lat = east_data['coordinates']
            
            try:
                # Only connect nodes at similar latitudes
                if abs(west_lat - east_lat) <= max_lat_diff:
                    # Calculate wrapped distance
                    dist, crosses = haversine_with_wrap(
                        west_data['coordinates'], 
                        east_data['coordinates']
                    )
                    
                    if crosses and not G.has_edge(west_node, east_node):
                        G.add_edge(
                            west_node, 
                            east_node,
                            weight=dist,
                            antimeridian=True,
                            edge_type='antimeridian_crossing'
                        )
                        edges_added += 1
            except Exception as e:
                print(f"Warning: Failed to connect nodes {west_node} and {east_node}: {e}")
                continue
    
    print(f"Added {edges_added} antimeridian crossing connections")
    return G

def get_wrapped_path(path, G):
    """
    Process a path to properly handle antimeridian crossings.
    Adds intermediate points when crossing the antimeridian to avoid drawing
    lines across the entire map.
    """
    wrapped_path = []
    
    for i in range(len(path) - 1):
        node1 = path[i]
        node2 = path[i + 1]
        
        coord1 = G.nodes[node1]['coordinates']
        coord2 = G.nodes[node2]['coordinates']
        
        wrapped_path.append(coord1)
        
        # Check if this edge crosses the antimeridian
        edge_data = G.get_edge_data(node1, node2)
        if edge_data.get('antimeridian', False):
            # Add intermediate points to properly draw the crossing
            lon1, lat1 = coord1
            lon2, lat2 = coord2
            
            # Add points at the antimeridian at the appropriate latitudes
            if lon1 < 0:  # West to East crossing
                wrapped_path.append([-180, lat1])
                wrapped_path.append([180, lat2])
            else:  # East to West crossing
                wrapped_path.append([180, lat1])
                wrapped_path.append([-180, lat2])
    
    # Add final point
    wrapped_path.append(G.nodes[path[-1]]['coordinates'])
    return wrapped_path

def optimize_transpacific_path(G, path):
    """
    Check if a path should use antimeridian crossing and optimize if needed.
    Returns the optimized path and whether it crosses the antimeridian.
    """
    if len(path) < 2:
        return path, False
        
    start_node = path[0]
    end_node = path[-1]
    start_coords = G.nodes[start_node]['coordinates']
    end_coords = G.nodes[end_node]['coordinates']
    
    # Calculate both direct and wrapped distances
    direct_dist, _ = haversine_with_wrap(start_coords, end_coords, wrap_threshold=float('inf'))
    wrapped_dist, crosses = haversine_with_wrap(start_coords, end_coords)
    
    # If wrapped distance is significantly shorter, try to find a path using antimeridian edges
    if wrapped_dist < direct_dist * 0.8:  # 20% threshold
        try:
            # Find path prioritizing antimeridian crossings
            path = nx.shortest_path(
                G, start_node, end_node,
                weight=lambda u, v, d: d['weight'] * (0.8 if d.get('antimeridian') else 1.0)
            )
            return path, True
        except nx.NetworkXNoPath:
            return path, False
            
    return path, False
