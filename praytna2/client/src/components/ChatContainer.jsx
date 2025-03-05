import React, { useEffect } from "react";
import useChatStore from "../store/useChatStore";

const ChatContainer = () => {
    const { messages, input, setInput, sendMessage, chatLoading, addMessage } = useChatStore();

    // Add a welcome message once on mount
    useEffect(() => {
        if (messages.length === 0) {
            addMessage({ role: "ai", content: "How can I help you today?" });
        }
    }, [messages.length, addMessage]);

    // Handle sending message on Enter key
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && input.trim() !== "" && !chatLoading) {
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="text-center py-4 text-2xl font-bold text-gray-700">
                Chat with AI
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 max-w-lg rounded-lg text-white shadow-md ${msg.role === "user" ? "bg-blue-500" : "bg-gray-700"}`}>
                            <strong>{msg.role === "user" ? "You" : "AI"}</strong>: {msg.content}
                        </div>
                    </div>
                ))}
                {chatLoading && (
                    <div className="text-gray-500 text-sm italic text-center mt-2">AI is typing...</div>
                )}
            </div>

            <div className="p-3 bg-white border-t border-gray-300 flex items-center sticky bottom-0">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={chatLoading}
                />
                <button 
                    onClick={sendMessage} 
                    className={`ml-3 px-4 py-2 rounded-md text-white font-semibold ${chatLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} transition-all text-sm`}
                    disabled={chatLoading}
                >
                    {chatLoading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default ChatContainer;
