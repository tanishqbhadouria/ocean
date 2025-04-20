# Add CORS support to your Flask backend

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import os
import networkx as nx
import pickle
from math import radians, sin, cos, sqrt, atan2
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
weather_cache = {}

# Global variables to store the graph
graph = None
graph_stats = None
graph_file = None

# ---- Open-Meteo Configuration ----
# Corrected Open-Meteo Configuration
BASE_URL = "https://marine-api.open-meteo.com/v1/marine"
VALID_PARAMS = {
    'hourly': 'wave_height,wind_wave_height,wind_wave_direction,wind_wave_period',
    'timezone': 'GMT'
}

def get_marine_weather(lat, lon):
    """Fetch marine-specific weather data with proper parameters"""
    print(f"\n=== Fetching marine weather for ({lat:.4f}, {lon:.4f}) ===")
    
    try:
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            print(f"!! Invalid coordinates ({lat}, {lon})")
            return None

        params = {**VALID_PARAMS, 'latitude': lat, 'longitude': lon}
        print(f"API Request: {BASE_URL}?{'&'.join(f'{k}={v}' for k,v in params.items())}")
        
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        
        json_data = response.json()
        print("API Response Structure:", json_data.keys())  # Debug response format
        
        # Extract marine-specific parameters
        return {
            'wave_height': json_data['hourly']['wave_height'][0],
            'wind_wave_height': json_data['hourly']['wind_wave_height'][0],
            'wind_wave_dir': json_data['hourly']['wind_wave_direction'][0],
            'wind_wave_period': json_data['hourly']['wind_wave_period'][0]
        }
        
    except requests.exceptions.HTTPError as e:
        print(f"!! API Error: {e}")
        print(f"Response Content: {response.text}")
        return None
    except Exception as e:
        print(f"!! Unexpected Error: {str(e)}")
        return None

# Updated weight calculation using marine parameters
def calculate_wind_penalty(wind_wave_dir, edge_dir, wind_wave_height):
    """Calculate navigation penalty based on wave conditions"""
    direction_diff = abs(wind_wave_dir - edge_dir) % 360
    direction_factor = cos(radians(min(direction_diff, 360 - direction_diff)))
    
    # Combine wave height and direction factors
    return wind_wave_height * direction_factor

# def update_weather_cache():
#     """Update cache with coordinate validation"""
#     print("\n=== Updating Weather Cache ===")
#     blacklisted_coords = set()
    
#     for node in graph.nodes():
#         coords = graph.nodes[node].get('coordinates')
#         if not coords:
#             continue
            
#         lon, lat = coords
#         if (lat, lon) in blacklisted_coords:
#             continue
            
#         weather = get_marine_weather(lat, lon)
#         if weather:
#             weather_cache[node] = weather
#         else:
#             print(f"Blacklisting problematic coordinates ({lat}, {lon})")
#             blacklisted_coords.add((lat, lon))

def haversine(coord1, coord2):
    """Calculate distance between two coordinates in km"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0  # Earth radius in kilometers

    # Convert decimal degrees to radians
    lat1, lon1 = map(radians, [lat1, lon1])
    lat2, lon2 = map(radians, [lat2, lon2])

    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = dlon - lon1

    # Haversine formula
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c

    return distance




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
        'ocean_graph_connected.pkl',
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

def find_nearest_node(graph, point, max_distance=5000):  # Already high enough at 5000km
    """Find the nearest node in the graph to a given point"""
    nearest_node = None
    min_distance = float('inf')
    backup_node = None
    backup_distance = float('inf')
    
    # Normalize the input coordinates
    lon, lat = point
    lon = ((lon + 180) % 360) - 180  # Normalize longitude to [-180, 180]
    
    for node, data in graph.nodes(data=True):
        if 'coordinates' not in data:
            continue
            
        node_lon, node_lat = data['coordinates']
        # Normalize node longitude
        node_lon = ((node_lon + 180) % 360) - 180
        
        try:
            dist = haversine([lon, lat], [node_lon, node_lat])
            
            # For coastal points, prefer nodes closer to shore
            if 'coastal' in data and data['coastal']:
                dist *= 0.8  # Give 20% preference to coastal nodes
            
            if dist < min_distance:
                min_distance = dist
                nearest_node = node
                
            # Keep a backup of any node within 6000km
            if dist < 6000 and dist < backup_distance:
                backup_distance = dist
                backup_node = node
                
        except ValueError as e:
            print(f"Error calculating distance for node {node}: {e}")
            continue
    
    # If no node found within max_distance but we have a backup, use it
    if nearest_node is None and backup_node is not None:
        print(f"Warning: Using backup node at {backup_distance:.2f} km")
        return backup_node, backup_distance
    
    if min_distance > max_distance:
        if backup_node is not None:
            return backup_node, backup_distance
        return None, min_distance
    
    return nearest_node, min_distance

def find_nearest_water_node(graph, point, max_distance=2500):  # Increased from 500
    """Find the nearest navigable water node to a given point"""
    nearest_node = None
    min_distance = float('inf')
    candidates = []
    search_radius = max_distance
    
    lon, lat = point
    lon = ((lon + 180) % 360) - 180  # Normalize longitude
    
    # First pass - look for nodes within initial search radius
    for node, data in graph.nodes(data=True):
        if 'coordinates' not in data:
            continue
            
        node_lon, node_lat = data['coordinates']
        node_lon = ((node_lon + 180) % 360) - 180
        
        try:
            dist = haversine([lon, lat], [node_lon, node_lat])
            
            # Store candidates and track closest node
            if dist <= search_radius:
                candidates.append((node, dist))
            
            if dist < min_distance:
                min_distance = dist
                nearest_node = node
                
        except ValueError as e:
            print(f"Error calculating distance for node {node}: {e}")
            continue
    
    # If no nodes found in initial radius, gradually increase search radius
    while not candidates and search_radius < 5000:  # Cap at 5000km
        search_radius += 500
        print(f"No nodes found within {search_radius-500}km, expanding search to {search_radius}km")
        
        for node, data in graph.nodes(data=True):
            if 'coordinates' not in data:
                continue
                
            node_lon, node_lat = data['coordinates']
            node_lon = ((node_lon + 180) % 360) - 180
            
            try:
                dist = haversine([lon, lat], [node_lon, node_lat])
                if dist <= search_radius:
                    candidates.append((node, dist))
            except ValueError:
                continue
    
    # Sort candidates by distance
    candidates.sort(key=lambda x: x[1])
    
    # If still no candidates, return closest node found (if any)
    if not candidates and nearest_node:
        print(f"No nodes found within {search_radius}km, using closest at {min_distance:.2f}km")
        return nearest_node, min_distance
    elif not candidates:
        return None, min_distance
        
    return candidates[0]

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
    """Calculate the shortest path between two points"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        source = data.get('source')
        destination = data.get('destination')
        vessel = data.get('vessel', {})  # Add default empty vessel dict
        
        if not source or not destination:
            return jsonify({"error": "Source and destination are required"}), 400
        
        # Log the received coordinates for debugging
        print(f"Finding path from {source} to {destination}")
        
        # Load graph
        g = load_graph()
        if g is None:
            return jsonify({"error": "Failed to load graph"}), 500
        
        # Find nearest water nodes with expanded search radius
        source_node, source_dist = find_nearest_water_node(g, source, max_distance=2500)
        dest_node, dest_dist = find_nearest_water_node(g, destination, max_distance=2500)
        
        print(f"Source: {source} -> Node: {source_node}, Distance: {source_dist:.2f} km")
        print(f"Destination: {destination} -> Node: {dest_node}, Distance: {dest_dist:.2f} km")
        
        if source_node is None or dest_node is None:
            return jsonify({
                "error": "No suitable route found",
                "details": {
                    "source_distance": source_dist if source_dist != float('inf') else None,
                    "dest_distance": dest_dist if dest_dist != float('inf') else None,
                    "source_found": source_node is not None,
                    "dest_found": dest_node is not None
                }
            }), 400
        
        print(f"Source node: {source_node}, distance: {source_dist:.2f} km")
        print(f"Destination node: {dest_node}, distance: {dest_dist:.2f} km")
        
        # Get graph edge count before path calculation for debugging
        print(f"Graph has {g.number_of_edges()} edges")
        print(f"Date line crossings: {sum(1 for _, _, d in g.edges(data=True) if d.get('date_line_crossing', False))}")
        
        # Check if path exists before calculating
        if not nx.has_path(g, source_node, dest_node):
            # Try to find path using the date line crossing edges
            print("No direct path found. Looking for path with date line crossing...")
            date_line_edges = [(u, v) for u, v, d in g.edges(data=True) if d.get('date_line_crossing', True)]
            print(f"Found {len(date_line_edges)} date line crossing edges")
            
            # Add temporary edges if needed for transpacific routes
            if abs(source[0] - destination[0]) > 180:
                print("Transpacific route detected, adding temporary connections...")
                g = connect_transpacific_points(g, source_node, dest_node)
            
            if not nx.has_path(g, source_node, dest_node):
                return jsonify({"error": "No path exists between the points"}), 404
        
        # Calculate shortest path
        start_time = time.time()
        path = nx.shortest_path(g, source=source_node, target=dest_node, weight='weight')
        end_time = time.time()
        
        # Extract coordinates and calculate total distance
        coordinates = []
        total_distance = 0
        
        # Add the actual source point as first coordinate
        coordinates.append(source)
        
        for i in range(len(path)):
            node = path[i]
            node_coords = list(g.nodes[node]['coordinates'])  # Convert to list to allow modification
            
            # Handle date line crossing
            if i > 0:
                prev_coords = coordinates[-1]
                if abs(prev_coords[0] - node_coords[0]) > 180:
                    # Adjust longitude to maintain continuity
                    if prev_coords[0] < 0:
                        node_coords[0] -= 360
                    else:
                        node_coords[0] += 360
            
            coordinates.append(node_coords)
            
            if i > 0:
                prev_node = path[i-1]
                if g.has_edge(prev_node, node):
                    edge_data = g.get_edge_data(prev_node, node)
                    total_distance += edge_data.get('weight', 0)
        
        # Add the actual destination point as last coordinate
        coordinates.append(destination)
        
        # Add transpacific flag if route crosses date line
        is_transpacific = any(
            abs(coordinates[i][0] - coordinates[i-1][0]) > 180 
            for i in range(1, len(coordinates))
        )
        
        # Prepare response
        result = {
            "source": source,
            "destination": destination,
            "source_node": source_node,
            "destination_node": dest_node,
            "path_length": len(path),
            "total_distance": total_distance,
            "computation_time": end_time - start_time,
            "coordinates": coordinates,
            "transpacific": is_transpacific
        }
        
        return jsonify(result)
        
    except nx.NetworkXNoPath:
        return jsonify({"error": "No path exists between the points"}), 404
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/optimal_path', methods=['POST'])
def optimal_path():
    print("\n=== New Optimal Path Request ===")
    start_total = time.time()
    
    data = request.get_json()
    source = data['source']
    destination = data['destination']
    
    print(f"Source: {source}")
    print(f"Destination: {destination}")
    
    # Load graph and find nodes
    g = load_graph()
    source_node, _ = find_nearest_water_node(g, source)
    dest_node, _ = find_nearest_water_node(g, destination)
    
    print(f"\nPathfinding Between:")
    print(f"Start Node: {source_node} ({g.nodes[source_node]['coordinates']})")
    print(f"End Node: {dest_node} ({g.nodes[dest_node]['coordinates']})")
    
    best_path = None
    best_cost = float('inf')
    
    for iteration in range(3):
        print(f"\n--- Iteration {iteration + 1} ---")
        path_start = time.time()
        
        try:
            path = nx.astar_path(g, source_node, dest_node, heuristic=haversine, weight='adjusted_weight')
        except nx.NetworkXNoPath:
            print("!! No Path Found !!")
            break
            
        current_cost = sum(g[u][v]['adjusted_weight'] for u,v in zip(path[:-1], path[1:]))
        print(f"Path Cost: {current_cost:.2f} km")
        print(f"Path Length: {len(path)} nodes")
        print(f"Calculation Time: {time.time() - path_start:.2f}s")
        
        if current_cost < best_cost:
            best_cost = current_cost
            best_path = path
            print("New Best Path!")
            
        # Adjust weights based on weather
        print("\nAdjusting Edge Weights:")
        for u, v in zip(path[:-1], path[1:]):
            edge_data = g[u][v]
            u_coords = g.nodes[u]['coordinates']
            v_coords = g.nodes[v]['coordinates']
            
            # Get midpoint weather
            mid_lat = (u_coords[1] + v_coords[1]) / 2
            mid_lon = (u_coords[0] + v_coords[0]) / 2
            weather = get_marine_weather(mid_lat, mid_lon)
            
            if not weather:
                print(f"Skipping edge {u}-{v} (weather data missing)")
                continue
                
            # Calculate direction penalty
            edge_dir = calculate_edge_direction(u_coords[0], u_coords[1], v_coords[0], v_coords[1])
            wind_penalty = weather['wind_speed'] * cos(radians(weather['wind_dir'] - edge_dir))
            
            # Update weight
            original = edge_data['base_weight']
            new_weight = original * (1 + wind_penalty/20)  # 20 m/s = 40 knots max wind
            
            print(f"Edge {u}-{v}:")
            print(f"Direction: {edge_dir:.1f}° vs Wind: {weather['wind_dir']:.1f}°")
            print(f"Wind Speed: {weather['wind_speed']} m/s")
            print(f"Penalty Factor: {wind_penalty:.2f}")
            print(f"Weight: {original:.2f} → {new_weight:.2f}")
            
            g[u][v]['adjusted_weight'] = new_weight
            
    print(f"\n=== Final Result ===")
    print(f"Best Path Cost: {best_cost:.2f} km")
    print(f"Total Processing Time: {time.time() - start_total:.2f}s")
    
    return jsonify({
        'path': convert_path_to_coordinates(g, best_path),
        'cost': best_cost,
        'iterations': iteration + 1
    })

def calculate_edge_direction(lon1, lat1, lon2, lat2):
    """Calculate edge direction with wrapping"""
    delta_lon = lon2 - lon1
    if abs(delta_lon) > 180:
        delta_lon = (delta_lon + 360) % 360
        
    direction = degrees(atan2(lat2 - lat1, delta_lon))
    return (direction + 360) % 360

def convert_path_to_coordinates(graph, path):
    """Convert node path to coordinates"""
    return [graph.nodes[node]['coordinates'] for node in path]

# ... (keep existing haversine, load_graph, find_nearest_water_node functions) ...

def connect_transpacific_points(graph, source_node, dest_node):
    """Add temporary connections for transpacific routes"""
    source_coords = graph.nodes[source_node]['coordinates']
    dest_coords = graph.nodes[dest_node]['coordinates']
    
    # Find nodes near the date line
    date_line_nodes = []
    for node, data in graph.nodes(data=True):
        if 'coordinates' not in data:
            continue
        lon = data['coordinates'][0]
        if abs(lon) > 175:  # Within 5 degrees of date line
            date_line_nodes.append((node, data['coordinates']))
    
    # Add connections to date line nodes if needed
    edges_added = 0
    for node, coords in date_line_nodes:
        # Connect to source if needed
        if abs(source_coords[0] - coords[0]) > 180:
            dist = haversine(source_coords, coords)
            if not graph.has_edge(source_node, node):
                graph.add_edge(source_node, node, weight=dist, temp=True)
                edges_added += 1
        
        # Connect to destination if needed
        if abs(dest_coords[0] - coords[0]) > 180:
            dist = haversine(dest_coords, coords)
            if not graph.has_edge(node, dest_node):
                graph.add_edge(node, dest_node, weight=dist, temp=True)
                edges_added += 1
    
    print(f"Added {edges_added} temporary transpacific connections")
    return graph

if __name__ == "__main__":
    # Load graph on startup
    print("Loading Ocean Graph...")
    load_graph()
    # Run the Flask app
    port = int(os.environ.get("PORT", 5000))  # Render sets this env variable
    app.run(host="0.0.0.0", port=port)        # Bind to all interfaces
