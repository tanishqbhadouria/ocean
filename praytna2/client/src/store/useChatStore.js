import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const useChatStore = create((set, get) => ({
    messages: [],
    input: "",
    chatLoading: false,

    setInput: (value) => set({ input: value }),

    sendMessage: async () => {
        const { input, messages } = get();
        if (!input.trim()) return; // Prevent sending empty messages

        set({ 
            messages: [...messages, { role: "user", content: input }], 
            input: "", 
            chatLoading: true 
        });

        try {
            const response = await axiosInstance.post("/chat", { message: input });

            set({ 
                messages: [...get().messages, { role: "assistant", content: response.data.response }],
                chatLoading: false 
            });

        } catch (error) {
            console.error("Error:", error);
            set({ chatLoading: false }); // Ensure loading stops on error
        }
    },
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
    }))
}));

export default useChatStore;
