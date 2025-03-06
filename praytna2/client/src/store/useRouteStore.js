import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const useRouteStore = create((set) => ({
    route: null,
    isLoading: false,
    error: null,
    routeData: null,

    saveRoute: async (routeData) => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.post("/path/add", routeData);
            
            set({ 
                route: response.data.routeId,
                isLoading: false 
            });
            
            toast.success(response.data.message);
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
            const response = await axiosInstance.get(`/path/${routeId}`);
            set({ routeData: response.data });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch route");
            throw error;
        }
    },

    clearRoute: () => set({ route: null, error: null })
}));

export default useRouteStore;
