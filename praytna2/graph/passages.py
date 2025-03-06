import pickle
import json
import networkx as nx
import numpy as np
from shapely.geometry import shape, Point, LineString, MultiLineString
from math import radians, sin, cos, sqrt, atan2

# --- Helper Functions ---

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
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def sample_points_along_line(geom, spacing=1.0):
    """
    Given a LineString or MultiLineString geometry, sample points along it 
    at approximately the specified spacing (in degrees, if using WGS84).
    Returns a list of (lon, lat) tuples.
    """
    points = []
    if geom.geom_type == 'LineString':
        length = geom.length
        num_points = max(int(length / spacing), 2)
        for i in np.linspace(0, 1, num_points):
            pt = geom.interpolate(i, normalized=True)
            points.append((pt.x, pt.y))
    elif geom.geom_type == 'MultiLineString':
        for line in geom:
            points.extend(sample_points_along_line(line, spacing))
    return points

# --- Load Existing Graph ---

# Load your pre-built ocean graph from a pickle file.
with open('ocean_graph.pkl', 'rb') as f:
    G = pickle.load(f)
print("Loaded existing ocean graph:")
print("Number of nodes:", G.number_of_nodes())
print("Number of edges:", G.number_of_edges())

# --- Load Passage Data ---

# Load passages (canals, straits, etc.) from a GeoJSON file.
with open('passages.geojson', 'r') as f:
    passages_data = json.load(f)

# Handle both FeatureCollection and GeometryCollection cases.
if passages_data.get('type') == 'FeatureCollection':
    passage_features = passages_data['features']
elif passages_data.get('type') == 'GeometryCollection':
    passage_features = [{'geometry': geom} for geom in passages_data.get('geometries', [])]
else:
    passage_features = [passages_data]

# --- Add Passage Nodes and Edges ---

# Prefix for passage nodes to distinguish them.
passage_prefix = "passage_"
passage_node_counter = 0

# Define a threshold distance (in kilometers) for connecting passage nodes to existing ocean nodes.
connection_threshold = 1.0  # adjust as needed

for feature in passage_features:
    geom_dict = feature.get('geometry')
    if not geom_dict:
        continue
    passage_geom = shape(geom_dict)
    # We handle LineString or MultiLineString geometries.
    if passage_geom.geom_type not in ['LineString', 'MultiLineString']:
        continue

    # Sample points along the passage geometry.
    sampled_pts = sample_points_along_line(passage_geom, spacing=1.0)
    prev_node = None
    prev_coord = None

    for pt in sampled_pts:
        # Create a unique node name for the passage node.
        node_name = f"{passage_prefix}{passage_node_counter}"
        passage_node_counter += 1

        # Add the passage node with an attribute to distinguish it.
        G.add_node(node_name, coordinates=pt, type='passage')

        # If there's a previous node on this passage, connect them.
        if prev_node is not None:
            w = haversine(prev_coord, pt)
            G.add_edge(prev_node, node_name, weight=w, type='passage_edge')
        prev_node = node_name
        prev_coord = pt

        # Optionally, connect this passage node to nearby ocean nodes.
        # We iterate through existing nodes that are not passages.
        for other_node, attr in G.nodes(data=True):
            if attr.get('type') == 'passage':
                continue  # Skip other passage nodes.
            d = haversine(pt, attr.get('coordinates'))
            if d < connection_threshold:
                # Connect the passage node to this ocean node if not already connected.
                if not G.has_edge(node_name, other_node):
                    G.add_edge(node_name, other_node, weight=d, type='connection')

# --- Save the Updated Graph ---

with open('ocean_graph_with_passages.pkl', 'wb') as f:
    pickle.dump(G, f)

print("Updated graph saved as 'ocean_graph_with_passages.pkl'.")
print("New node count:", G.number_of_nodes())
print("New edge count:", G.number_of_edges())
