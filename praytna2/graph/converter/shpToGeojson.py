"""
Tool for converting ESRI Shapefiles to GeoJSON format.
Preserves all attributes and handles coordinate system transformations.
"""

import os
import sys
import argparse
import json
import geopandas as gpd
from shapely.geometry import Point, LineString, Polygon, mapping

def convert_shapefile_to_geojson(input_file, output_file, crs='EPSG:4326'):
    """
    Convert a shapefile to GeoJSON format
    
    Args:
        input_file (str): Path to the input shapefile
        output_file (str): Path to save the output GeoJSON
        crs (str): Coordinate reference system for output (default: EPSG:4326/WGS84)
    
    Returns:
        bool: True if conversion was successful, False otherwise
    """
    try:
        print(f"Reading shapefile: {input_file}")
        # Read the shapefile
        gdf = gpd.read_file(input_file)
        
        # Check if CRS needs to be transformed
        if gdf.crs and gdf.crs != crs:
            print(f"Transforming CRS from {gdf.crs} to {crs}")
            gdf = gdf.to_crs(crs)
        elif not gdf.crs:
            print(f"Warning: No CRS specified in shapefile. Using {crs}")
            gdf.set_crs(crs, inplace=True)
        
        # Save to GeoJSON
        print(f"Writing GeoJSON: {output_file}")
        gdf.to_file(output_file, driver='GeoJSON')
        
        # Report some statistics
        num_features = len(gdf)
        geometry_types = gdf.geometry.type.unique()
        print(f"Converted {num_features} features. Geometry types: {', '.join(geometry_types)}")
        
        return True
    except Exception as e:
        print(f"Error converting shapefile to GeoJSON: {e}")
        return False

def extract_ports_from_geojson(input_file, output_file, port_properties=None):
    """
    Extract port information from a GeoJSON file and save it to a new GeoJSON
    with simplified properties
    
    Args:
        input_file (str): Path to the input GeoJSON
        output_file (str): Path to save the output GeoJSON
        port_properties (list): List of property names to keep
    
    Returns:
        bool: True if extraction was successful, False otherwise
    """
    if port_properties is None:
        port_properties = ['PORT_NAME', 'COUNTRY', 'LATITUDE', 'LONGITUDE']
    
    try:
        # Read the GeoJSON
        gdf = gpd.read_file(input_file)
        
        # Filter for points only (assuming ports are represented as points)
        ports_gdf = gdf[gdf.geometry.type == 'Point']
        
        # Filter properties to keep
        available_props = [p for p in port_properties if p in ports_gdf.columns]
        ports_gdf = ports_gdf[available_props + ['geometry']]
        
        # Save to GeoJSON
        ports_gdf.to_file(output_file, driver='GeoJSON')
        print(f"Extracted {len(ports_gdf)} ports to {output_file}")
        
        return True
    except Exception as e:
        print(f"Error extracting ports from GeoJSON: {e}")
        return False

def merge_geojson_files(input_files, output_file):
    """
    Merge multiple GeoJSON files into one
    
    Args:
        input_files (list): List of input GeoJSON file paths
        output_file (str): Path to save the merged GeoJSON
    
    Returns:
        bool: True if merge was successful, False otherwise
    """
    try:
        # Read and merge all GeoJSON files
        gdfs = []
        for file_path in input_files:
            print(f"Reading: {file_path}")
            gdf = gpd.read_file(file_path)
            gdfs.append(gdf)
        
        # Concatenate all GeoDataFrames
        merged_gdf = gpd.GeoDataFrame(pd.concat(gdfs, ignore_index=True))
        
        # Save to GeoJSON
        merged_gdf.to_file(output_file, driver='GeoJSON')
        
        print(f"Merged {len(input_files)} files with {len(merged_gdf)} features to {output_file}")
        return True
    except Exception as e:
        print(f"Error merging GeoJSON files: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Convert ESRI Shapefiles to GeoJSON format')
    parser.add_argument('input', help='Input shapefile path')
    parser.add_argument('output', help='Output GeoJSON path')
    parser.add_argument('--crs', default='EPSG:4326', help='Output coordinate reference system (default: EPSG:4326/WGS84)')
    parser.add_argument('--extract-ports', action='store_true', help='Extract ports from GeoJSON')
    parser.add_argument('--port-props', nargs='+', help='Port properties to keep')
    
    args = parser.parse_args()
    
    if args.extract_ports:
        # First convert shapefile to GeoJSON, then extract ports
        temp_geojson = args.output + '.temp.geojson'
        if convert_shapefile_to_geojson(args.input, temp_geojson, args.crs):
            success = extract_ports_from_geojson(temp_geojson, args.output, args.port_props)
            os.remove(temp_geojson)
            return 0 if success else 1
    else:
        # Just convert shapefile to GeoJSON
        success = convert_shapefile_to_geojson(args.input, args.output, args.crs)
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
