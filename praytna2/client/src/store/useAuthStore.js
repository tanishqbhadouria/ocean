import {create} from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const useAuthStore = create((set) => ({
    ship: null,

    signup: async (shipData) => {
        try {
            const response = await axiosInstance.post('/signup', shipData);
            set({ ship: response.data });
            toast.success('Signup successful!');
            return true;
        } catch (error) {
            console.error('Signup failed:', error);
            toast.error('Signup failed. Please try again.');
            set({ ship: null });
            return false;
        }
    },

    login : async (shipData) => {
        try {
            const response = await axiosInstance.post('/login', shipData);
            set({ ship: response.data });
            toast.success('Login successful!');
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed. Please try again.');
            set({ ship: null });
        }
    }
}));

export default useAuthStore;