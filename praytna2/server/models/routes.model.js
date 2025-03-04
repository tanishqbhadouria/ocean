import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RoutesSchema = new Schema({
    source: {
        name: { type: String, required: true },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    destination: {
        name: { type: String, required: true },
        coordinates: {
            type: [Number], 
            required: true
        }
    },

    currPath: {
        type: [[Number]], 
        required: true
    },

    shipCount: {
        type: Number,
        default: 0
    },

    estimatedTime: { 
        type: Number, 
        default: 0 
    },

    distance: { 
        type: Number, 
        default: 0 
    },

    fuelConsumption: { 
        type: Number, 
        default: 0 
    },

    
}, { timestamps: true });

export default mongoose.model('Routes', RoutesSchema);
