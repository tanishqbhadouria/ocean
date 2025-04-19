import unittest
from app2 import app, load_graph, find_nearest_water_node, haversine
import json

class TestNYToLARoute(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.graph = load_graph()
        self.ny_coords = [-74.0060, 40.7128]  # New York
        self.la_coords = [-118.2426, 34.0522]  # Los Angeles
        
    def test_ny_la_path_request(self):
        """Test path finding between NY and LA"""
        test_data = {
            'source': self.ny_coords,
            'destination': self.la_coords
        }
        
        response = self.app.post('/shortest_ocean_path',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Verify basic response structure
        self.assertIn('coordinates', data)
        self.assertIn('total_distance', data)
        self.assertIn('path_length', data)
        
        # Verify path goes through Panama Canal area
        panama_found = False
        for coord in data['coordinates']:
            # Check if path passes near Panama (rough coordinates)
            if (-83 <= coord[0] <= -77) and (7 <= coord[1] <= 11):
                panama_found = True
                break
        self.assertTrue(panama_found, "Path should go through Panama Canal area")
        
        # Verify reasonable distance (NY to LA should be 5000-9000 km via Panama)
        self.assertGreater(data['total_distance'], 5000)
        self.assertLess(data['total_distance'], 9000)

    def test_nearest_water_nodes(self):
        """Test finding nearest water nodes for NY and LA"""
        ny_node, ny_dist = find_nearest_water_node(self.graph, self.ny_coords)
        la_node, la_dist = find_nearest_water_node(self.graph, self.la_coords)
        
        # NY should find a water node within 100km
        self.assertIsNotNone(ny_node)
        self.assertLess(ny_dist, 100)
        
        # LA should find a water node within 100km
        self.assertIsNotNone(la_node)
        self.assertLess(la_dist, 100)
    
    def test_path_validity(self):
        """Test if calculated path is valid"""
        test_data = {
            'source': self.ny_coords,
            'destination': self.la_coords
        }
        
        response = self.app.post('/shortest_ocean_path',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        data = json.loads(response.data)
        coords = data['coordinates']
        
        # Test consecutive points aren't too far apart
        for i in range(len(coords)-1):
            dist = haversine(coords[i], coords[i+1])
            self.assertLess(dist, 500, "Consecutive points should not be more than 500km apart")

if __name__ == '__main__':
    unittest.main()
