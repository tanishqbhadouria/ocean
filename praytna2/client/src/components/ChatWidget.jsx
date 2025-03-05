import React, { useState } from "react";
import ChatContainer from "./ChatContainer";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // For smooth animations

const ChatWidget = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="relative z-[1000]">
            {/* Floating Chat Button */}
            {!isChatOpen && (
                <motion.button
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl 
                    hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 border-2 border-blue-400"
                    onClick={() => setIsChatOpen(true)}
                    whileHover={{ scale: 1.1 }}
                >
                    <MessageCircle size={28} />
                </motion.button>
            )}

            {/* Chat Panel with Smooth Animation */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-16 right-6 w-80 h-[500px] bg-white/90 backdrop-blur-lg shadow-xl 
                        border border-gray-200 rounded-3xl flex flex-col overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 px-4 flex justify-between items-center shadow-lg">
                            <span className="font-semibold text-lg">Chat with AI</span>
                            <button 
                                className="text-white hover:text-gray-300 transition"
                                onClick={() => setIsChatOpen(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 overflow-y-auto p-3">
                            <ChatContainer />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatWidget;
