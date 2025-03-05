import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const useChatStore = create((set, get) => ({
    chatLoading : false,
    messages: [],
    input: "",
    
    setInput: (value) => set({ input: value }),

    sendMessage: async () => {
        set({ chatLoading : true });
        const { input, messages } = get();
        if (!input.trim()) return; // Prevent sending empty messages

        // Add user message to chat
        set({ messages: [...messages, { role: "user", content: input }], input: "" });

        try {
            const response = await axiosInstance.post("/chat", { message: input });

            // Add AI response to chat
            set({ messages: [...get().messages, { role: "assistant", content: response.data.response }] });

        } catch (error) {
            console.error("Error:", error);
        }finally{
            set({ chatLoading : false });
        }
    },

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
    }))
    
}));

export default useChatStore;
