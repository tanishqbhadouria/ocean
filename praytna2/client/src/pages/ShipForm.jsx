import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ShipForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        mmsi: "",
        password: "",
        name: "",
        type: "Cargo",
        capacity: "",
        currentLocation: "",
        speed: "0",
        status: "Docked",
        assignedRoute: "",
        fuelLevel: "100"
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Special handler for currentLocation (split longitude, latitude)
    const handleLocationChange = (e) => {
        const value = e.target.value;
        const coords = value.split(",").map(coord => parseFloat(coord.trim()));
        
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            setFormData(prevData => ({
                ...prevData,
                currentLocation: coords
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                currentLocation: value // Keep raw input for user to correct
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert necessary fields to numbers
        const formattedData = {
            ...formData,
            mmsi: parseInt(formData.mmsi),
            capacity: parseFloat(formData.capacity),
            speed: parseFloat(formData.speed),
            fuelLevel: parseFloat(formData.fuelLevel),
            currentLocation: Array.isArray(formData.currentLocation) ? formData.currentLocation : []
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (onSubmit) onSubmit(data);
            navigate("/ships"); // Redirect after successful submission
        } catch (err) {
            setError("Failed to add ship: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="number" name="mmsi" placeholder="MMSI" value={formData.mmsi} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="name" placeholder="Ship Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
                    {["Cargo", "Tanker", "Container", "Passenger", "Fishing", "Military", "Other"].map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <input type="number" name="capacity" placeholder="Capacity (tons)" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded" required />

                <input type="text" name="currentLocation" placeholder="Current Location (longitude, latitude)" value={formData.currentLocation} onChange={handleLocationChange} className="w-full p-2 border rounded" required />

                <input type="number" name="speed" placeholder="Speed (knots)" value={formData.speed} onChange={handleChange} className="w-full p-2 border rounded" required />

                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
                    {["Docked", "In Transit", "Anchored", "Under Maintenance"].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <input type="text" name="assignedRoute" placeholder="Assigned Route (ID)" value={formData.assignedRoute} onChange={handleChange} className="w-full p-2 border rounded" />

                <input type="number" name="fuelLevel" placeholder="Fuel Level (%)" value={formData.fuelLevel} onChange={handleChange} className="w-full p-2 border rounded" required />

                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={loading}
                >
                    {loading ? 'Adding Ship...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default ShipForm;
