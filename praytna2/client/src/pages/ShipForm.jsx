import { useState } from "react";

const ShipForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        mmsi: "",
        name: "",
        type: "Cargo",
        capacity: "",
        currentLocation: "",
        speed: "0",
        status: "Docked",
        assignedRoute: "",
        fuelLevel: "100"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Add New Ship</h2>
            <div className="space-y-4">
                <input type="number" name="mmsi" placeholder="MMSI" value={formData.mmsi} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="name" placeholder="Ship Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
                    {["Cargo", "Tanker", "Container", "Passenger", "Fishing", "Military", "Other"].map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input type="number" name="capacity" placeholder="Capacity (tons)" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="currentLocation" placeholder="Current Location (lon, lat)" value={formData.currentLocation} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="speed" placeholder="Speed (knots)" value={formData.speed} onChange={handleChange} className="w-full p-2 border rounded" required />
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
                    {["Docked", "In Transit", "Anchored", "Under Maintenance"].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <input type="text" name="assignedRoute" placeholder="Assigned Route (ID)" value={formData.assignedRoute} onChange={handleChange} className="w-full p-2 border rounded" />
                <input type="number" name="fuelLevel" placeholder="Fuel Level (%)" value={formData.fuelLevel} onChange={handleChange} className="w-full p-2 border rounded" required />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Submit</button>
            </div>
        </form>
    );
};

export default ShipForm;
