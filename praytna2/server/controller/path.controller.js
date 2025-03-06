import Routes from '../models/routes.model.js';
import Ship from '../models/ships.model.js';

// Add a new route to the database
export const addRoute = async (req, res) => {
    try {
        const { source, destination, currPath, estimatedTime, distance, fuelConsumption } = req.body;
        // console.log(req.body?.currPath);
        const shipId = req.ship._id.toString(); // Get ship ID from request
        const ship = await Ship.findById(shipId);

        // First check if route already exists
        const existingRoute = await Routes.findOne({
            'source.coordinates': source.coordinates,
            'destination.coordinates': destination.coordinates
        });

        let routeId;

        if (existingRoute) {
            // Increment ship count for existing route
            existingRoute.shipCount += 1;
            await existingRoute.save();
            routeId = existingRoute._id;
        } else {
            // Create new route if none exists
            const newRoute = new Routes({
                source: {
                    name: source.name,
                    coordinates: source.coordinates
                },
                destination: {
                    name: destination.name,
                    coordinates: destination.coordinates
                },
                currPath,
                estimatedTime : ship.speed ? distance / ship.speed : estimatedTime,
                distance,
                fuelConsumption,
                shipCount: 1
            });
            const savedRoute = await newRoute.save();
            routeId = savedRoute._id;
        }

        // Assign route to ship
        if (!ship) {
            return res.status(404).json({ message: 'Ship not found' });
        }

        ship.assignedRoute = routeId;
        await ship.save();

        res.status(200).json({
            message: existingRoute ? 'Route already exists' : 'New route created',
            routeId: routeId,
            route: existingRoute || newRoute
        });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all saved routes
export const getRoutes = async (req, res) => {
    try {
        const routes = await Routes.find();
        res.status(200).json(routes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get a specific route by source and destination
export const getRoute = async (req, res) => {
    try {
        const sourceCoords = req.query.source.split(',').map(Number);
        const destCoords = req.query.destination.split(',').map(Number);

        const route = await Routes.findOne({
            'source.coordinates': sourceCoords,
            'destination.coordinates': destCoords
        });

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.status(200).json(route);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update ship count for a route
export const updateShipCount = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { increment } = req.body; // true to increment, false to decrement

        const route = await Routes.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        route.shipCount += increment ? 1 : -1;
        if (route.shipCount < 0) route.shipCount = 0;

        const updatedRoute = await route.save();
        res.status(200).json(updatedRoute);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRouteById = async (req, res) => {
    try {
        const { routeId } = req.params;
        const route = await Routes.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json(route);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

