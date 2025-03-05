import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const useAuthStore = create((set) => ({
  ship: null,
  checkingAuth: true,

  checkAuth: async () => {
    try {
      set({ checkingAuth: true });
      const res = await axiosInstance.get("/auth/ship");
      set({ ship: res.data.ship });
    } catch (error) {
      set({ ship: null });
    } finally {
      set({ checkingAuth: false });
    }
  },

  signup: async (shipData) => {
    try {
      const response = await axiosInstance.post("/auth/signup", shipData);
      set({ ship: response.data });
      toast.success("Signup successful!");
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.response.data.message || "Signup failed. Please try again.");
      set({ ship: null });
      return false;
    }
  },

  login: async (shipData) => {
    try {
      const response = await axiosInstance.post("/auth/login", shipData);
      set({ ship: response.data });
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response.data.message || "Login failed. Please try again.");
      set({ ship: null });
      return false;
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      if (res.status === 200) set({ ship: null });
      toast.success("Logout successfully");
    } catch (error) {
      toast.error(error.response.data.message || "something went wrong");
    }
  },
}));

export default useAuthStore;
