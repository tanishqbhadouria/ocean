import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const useRouteStore = create((set) => ({
    route: null,
    isLoading: false,
    error: null,

    saveRoute: async (routeData) => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.post("/api/path/add", {
                ...routeData,
                currPath: routeData.currPath || []  // Ensure currPath is always defined
            });
            
            set({ 
                route: response.data.route,
                isLoading: false 
            });
            
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to save route";
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    getRouteById: async (routeId) => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get(`/api/path/${routeId}`);
            
            set({ 
                route: response.data,
                isLoading: false 
            });
            
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to fetch route";
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    clearRoute: () => set({ route: null, error: null })
}));

export default useRouteStore;
