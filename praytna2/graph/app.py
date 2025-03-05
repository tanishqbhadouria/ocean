# Add CORS support to your Flask backend

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import networkx as nx
import pickle
from math import radians, sin, cos, sqrt, atan2
import time
from itertools import combinations

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to store the graph
graph = None
graph_stats = None
graph_file = None

def haversine(coord1, coord2):
    """Calculate distance between two coordinates in km with error handling"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0  # Earth radius in kilometers

    try:
        # Normalize coordinates to valid ranges
        lon1 = ((lon1 + 180) % 360) - 180
        lon2 = ((lon2 + 180) % 360) - 180
        lat1 = max(-90, min(90, lat1))
        lat2 = max(-90, min(90, lat2))

        # Convert to radians
        lat1, lat2 = radians(lat1), radians(lat2)
        lon1, lon2 = radians(lon1), lon2

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        # Use more stable formula for small distances
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        
        # Clamp 'a' to valid range for asin
        a = max(0.0, min(1.0, a))
        
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

    except Exception as e:
        print(f"Warning: Haversine calculation failed: {e}")
        # Fallback to simple Euclidean approximation
        return sqrt((lon2-lon1)**2 + (lat2-lat1)**2) * 111  # 111 km per degree

# Add date line crossing connections to the graph

def connect_date_line_edges(graph):
    """
    Connect nodes across the date line boundary (-180/+180)
    This is necessary because the Earth is round, and shortest routes 
    might need to cross the date line
    """
    print("Adding date line crossing connections...")
    
    # Find nodes close to the date line
    west_nodes = []  # Nodes near -180
    east_nodes = []  # Nodes near +180
    
    for node, data in graph.nodes(data=True):
        if 'coordinates' not in data:
            continue
            
        lon = data['coordinates'][0]
        if -180 <= lon <= -175:
            west_nodes.append((node, data['coordinates']))
        elif 175 <= lon <= 180:
            east_nodes.append((node, data['coordinates']))
    
    print(f"Found {len(west_nodes)} west nodes and {len(east_nodes)} east nodes near date line")
    
    # Connect across date line
    edges_added = 0
    for west_node, west_coords in west_nodes:
        west_lon, west_lat = west_coords
        
        # Find nodes at approximately the same latitude on the east side
        for east_node, east_coords in east_nodes:
            east_lon, east_lat = east_coords
            
            # Check if latitude is close enough (within 1 degree)
            if abs(west_lat - east_lat) <= 1.0:
                # Calculate distance as if these points were next to each other
                # Add 360 to the west longitude to make it positive for the calculation
                adjusted_west_lon = west_lon + 360
                
                # Calculate distance between points considering them adjacent
                dist = haversine([adjusted_west_lon, west_lat], [east_lon, east_lat])
                
                # Add edge to connect across date line
                if not graph.has_edge(west_node, east_node):
                    graph.add_edge(
                        west_node, east_node,
                        weight=dist,
                        date_line_crossing=True
                    )
                    edges_added += 1
    
    print(f"Added {edges_added} date line crossing edges")
    return graph

def load_graph():
    """Load the ocean routing graph"""
    global graph, graph_stats, graph_file
    
    # If graph already loaded, return it
    if graph is not None:
        return graph
    
    # Try to find a graph file
    candidates = [
        'models/ocean_graph_5deg.pkl',
        'ocean_graph_1deg_updated.pkl',
        'ocean_graph_1deg.pkl',
        'ocean_graph_with_passages.pkl',
        'ocean_graph.pkl'
    ]
    
    for candidate in candidates:
        if os.path.exists(candidate):
            try:
                print(f"Loading graph from {candidate}")
                with open(candidate, 'rb') as f:
                    data = pickle.load(f)
                
                if isinstance(data, tuple) and len(data) == 2:
                    graph = data[0]
                    graph_stats = data[1]
                elif isinstance(data, nx.Graph):
                    graph = data
                    graph_stats = {"node_count": graph.number_of_nodes(), "edge_count": graph.number_of_edges()}
                else:
                    continue
                    
                graph_file = candidate
                print(f"Loaded graph with {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges")
                
                # Check if we need to add date line connections
                if graph_file != 'ocean_graph_connected.pkl' and not any(d.get('date_line_crossing', False) for u, v, d in graph.edges(data=True)):
                    print("Graph doesn't have date line crossings. Adding them now...")
                    graph = connect_date_line_edges(graph)
                    
                    # Save the connected graph for future use
                    try:
                        print("Saving graph with date line connections...")
                        with open('ocean_graph_connected.pkl', 'wb') as f:
                            if graph_stats:
                                graph_stats['date_line_connected'] = True
                            else:
                                graph_stats = {'date_line_connected': True}
                            pickle.dump((graph, graph_stats), f)
                        print("Saved graph with date line connections")
                    except Exception as e:
                        print(f"Error saving graph: {e}")
                
                return graph
                    
            except Exception as e:
                print(f"Error loading {candidate}: {e}")
                continue
    
    return None

def find_nearest_node(graph, point, max_distance=1000):  # Increased max distance to 1000 km
    """Find the nearest node in the graph to a given point"""
    nearest_node = None
    min_distance = float('inf')
    
    for node, data in graph.nodes(data=True):
        if 'coordinates' in data:
            dist = haversine(point, data['coordinates'])
            if dist < min_distance:
                min_distance = dist
                nearest_node = node
    
    if min_distance > max_distance:
        return None, min_distance
    
    return nearest_node, min_distance

def normalize_coordinates(coord):
    """
    Normalize coordinates to [longitude, latitude] format.
    Input should already be in [longitude, latitude] format from frontend.
    Just validate the ranges.
    """
    if len(coord) != 2:
        raise ValueError("Coordinates must be [longitude, latitude]")
        
    lon, lat = coord
    
    # Validate ranges
    if not (-180 <= lon <= 180):
        raise ValueError(f"Invalid longitude {lon}. Must be between -180 and 180")
    if not (-90 <= lat <= 90):
        raise ValueError(f"Invalid latitude {lat}. Must be between -90 and 90")
        
    return [lon, lat]

def normalize_path(path_coordinates):
    """
    Normalize path coordinates to handle antimeridian crossing and ensure
    coordinates take the shortest path around the globe.
    """
    if not path_coordinates or len(path_coordinates) < 2:
        return path_coordinates
        
    normalized = [path_coordinates[0]]
    
    for i in range(1, len(path_coordinates)):
        prev = path_coordinates[i-1]
        curr = path_coordinates[i]
        
        # Check if we need to adjust longitude to take shorter path
        lon_diff = curr[0] - prev[0]
        if abs(lon_diff) > 180:
            # Adjust longitude to take shorter path around the globe
            if lon_diff > 0:
                curr = [curr[0] - 360, curr[1]]
            else:
                curr = [curr[0] + 360, curr[1]]
                
        normalized.append(curr)
    
    return normalized

def load_maritime_passages():
    """Load maritime passage definitions"""
    try:
        with open('config/maritime_passages.json', 'r') as f:
            return json.load(f)['passages']
    except Exception as e:
        print(f"Warning: Could not load maritime passages: {e}")
        return []

def add_maritime_passages(graph, passages):
    """Add maritime passage connections to the graph"""
    print("Adding maritime passages...")
    passages_added = 0
    
    for passage in passages:
        # Find nearest nodes to passage endpoints
        start_node, start_dist = find_nearest_node(graph, passage['coordinates'][0])
        end_node, end_dist = find_nearest_node(graph, passage['coordinates'][1])
        
        if start_node and end_node:
            # Add direct connection with reduced weight
            dist = haversine(passage['coordinates'][0], passage['coordinates'][1])
            weight = dist * passage.get('weight_multiplier', 0.8)  # Reduce weight to prefer passages
            
            graph.add_edge(
                start_node, end_node,
                weight=weight,
                passage_name=passage['name'],
                is_passage=True
            )
            passages_added += 1
            
    print(f"Added {passages_added} maritime passages")
    return graph

def calculate_ocean_path(graph, source_node, dest_node, vessel_data):
    """Calculate path using only ocean nodes and maritime passages"""
    
    def ocean_weight(u, v, edge_data):
        """Custom weight function that only allows water routes"""
        # Check if either node is not an ocean node or maritime passage
        u_data = graph.nodes[u]
        v_data = graph.nodes[v]
        
        # Allow if it's a maritime passage
        if edge_data.get('is_passage'):
            return edge_data['weight'] * 0.8
            
        # Check if both nodes are water nodes
        if (u_data.get('type') == 'ocean' and v_data.get('type') == 'ocean'):
            return edge_data['weight']
            
        # Return infinity for non-water paths
        return float('inf')
    
    try:
        # Use custom weight function with A* algorithm
        path = nx.astar_path(
            graph,
            source_node,
            dest_node,
            weight=ocean_weight,
            heuristic=lambda n1, n2: haversine(
                graph.nodes[n1]['coordinates'],
                graph.nodes[n2]['coordinates']
            ) * 0.8
        )
        return path
    except nx.NetworkXNoPath:
        return None

def find_nearest_ocean_node(graph, point, max_distance=1000):
    """Find the nearest ocean or port node with improved search"""
    nearest_node = None
    min_distance = float('inf')
    candidates = []
    
    for node, data in graph.nodes(data=True):
        # Only consider ocean nodes and ports
        if data.get('type') in ['ocean', 'port']:
            dist = haversine(point, data['coordinates'])
            if dist < min_distance:
                min_distance = dist
                nearest_node = node
            # Keep track of all close nodes
            if dist < max_distance:
                candidates.append((node, dist, data))
    
    if not candidates:
        print(f"No ocean nodes found within {max_distance}km of point {point}")
        return None, min_distance
    
    # Sort candidates by distance
    candidates.sort(key=lambda x: x[1])
    
    # Try to prefer ocean nodes over ports if they're within reasonable distance
    ocean_candidates = [c for c in candidates if c[2].get('type') == 'ocean']
    if ocean_candidates and ocean_candidates[0][1] < min_distance * 1.2:  # Within 20% of closest distance
        return ocean_candidates[0][0], ocean_candidates[0][1]
        
    # If no good ocean nodes, use the closest port or ocean node
    return nearest_node, min_distance

@app.route('/', methods=['GET'])
def index():
    """Return API information"""
    return jsonify({
        "name": "Voyage Ocean Routing API",
        "version": "1.0",
        "endpoints": [
            "/graph_info",
            "/shortest_ocean_path",
            "/optimal_ocean_path"
        ]
    })

@app.route('/graph_info', methods=['GET'])
def get_graph_info():
    """Return information about the loaded graph"""
    g = load_graph()
    if g is None:
        return jsonify({"error": "No graph loaded"}), 500
        
    info = {
        "nodes": g.number_of_nodes(),
        "edges": g.number_of_edges(),
        "file": graph_file
    }
    
    if graph_stats:
        info["stats"] = graph_stats
    
    return jsonify(info)

@app.route('/shortest_ocean_path', methods=['POST'])
def shortest_ocean_path():
    """Calculate optimal ocean path between two points"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        source = data.get('source')  # Expecting [lon, lat]
        destination = data.get('destination')  # Expecting [lon, lat]
        vessel = data.get('vessel', {
            'speed': 20,
            'consumption_rate': 1.0,
            'type': 'generic'
        })
        
        if not source or not destination:
            return jsonify({"error": "Source and destination are required"}), 400
            
        try:
            # Validate coordinate ranges
            source = normalize_coordinates(source)
            destination = normalize_coordinates(destination)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        
        # Log normalized coordinates
        print(f"Normalized coordinates - Source: {source}, Destination: {destination}")
        
        # Check if this is a transpacific route (major longitude difference)
        source_lon = source[0]
        dest_lon = destination[0]
        lon_diff = abs(source_lon - dest_lon)
        transpacific = lon_diff > 180  # If true, route should cross the date line
        
        if transpacific:
            print(f"Detected potential transpacific route: lon diff = {lon_diff}°")
        
        # Log the received coordinates for debugging
        print(f"Finding path from {source} to {destination}")
        
        # Load graph and maritime passages
        g = load_graph()
        if not hasattr(g, 'has_passages'):
            passages = load_maritime_passages()
            g = add_maritime_passages(g, passages)
            g.has_passages = True
        
        # Use expanded search radius for source and destination
        source_node, source_dist = find_nearest_ocean_node(g, source, max_distance=2000)
        dest_node, dest_dist = find_nearest_ocean_node(g, destination, max_distance=2000)
        
        if not source_node:
            return jsonify({
                "error": f"Could not find ocean node near source point. " 
                        f"Nearest node is {source_dist:.1f}km away."
            }), 400
            
        if not dest_node:
            return jsonify({
                "error": f"Could not find ocean node near destination point. "
                        f"Nearest node is {dest_dist:.1f}km away."
            }), 400
            
        print(f"Found nodes - Source: {g.nodes[source_node]}, Destination: {g.nodes[dest_node]}")
        
        # Calculate path using water-only routing
        path = calculate_ocean_path(g, source_node, dest_node, vessel)
        
        if not path:
            return jsonify({"error": "No valid ocean path found"}), 404
            
        # Extract path details
        coordinates = []
        total_distance = 0
        passages_used = []
        
        # Add source point
        coordinates.append(source)
        
        # Extract path details including passages used
        for i in range(len(path)-1):
            node1, node2 = path[i], path[i+1]
            edge_data = g.get_edge_data(node1, node2)
            
            coordinates.append(g.nodes[node2]['coordinates'])
            total_distance += edge_data['weight']
            
            if edge_data.get('is_passage'):
                passages_used.append(edge_data['passage_name'])
        
        # Add destination point
        coordinates.append(destination)
        
        # Calculate vessel-specific data
        speed = vessel.get('speed', 20)  # km/h
        consumption_rate = vessel.get('consumption_rate', 1.0)  # units per km
        
        estimated_time = total_distance / speed if speed > 0 else 0
        fuel_consumption = total_distance * consumption_rate
        
        # Prepare response
        result = {
            "source": source,
            "destination": destination,
            "vessel": vessel,
            "path_length": len(path),
            "total_distance": total_distance,
            "estimated_time": estimated_time,
            "fuel_consumption": fuel_consumption,
            "coordinates": coordinates
        }
        
        # Normalize the path coordinates
        if 'coordinates' in result:
            result['coordinates'] = normalize_path(result['coordinates'])
            
        # Add passage information to response
        result['passages_used'] = passages_used
        
        return jsonify(result)
        
    except nx.NetworkXNoPath:
        return jsonify({"error": "No path exists between the points"}), 404
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
if __name__ == "__main__":
    # Load graph on startup
    load_graph()
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
