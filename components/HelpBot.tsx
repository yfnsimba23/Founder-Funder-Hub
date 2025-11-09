
import React, { useState, useRef, useEffect } from 'react';
import { HelpIcon, CloseIcon, SendIcon } from './Icons';

interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

export const HelpBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{ sender: 'bot', text: "Hi! I'm the Ember assistant. How can I help you use the app?" }]);
        } else {
            setMessages([]);
        }
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getBotResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('profile') || lowerInput.includes('edit')) {
            return "You can edit your profile by clicking 'My Profile' in the navigation bar.";
        }
        if (lowerInput.includes('post') || lowerInput.includes('update')) {
            return "You can post an update for everyone to see on the 'Feed' page.";
        }
        if (lowerInput.includes('message') || lowerInput.includes('chat')) {
            return "You can message any user by going to their profile in the 'Directories' page and clicking 'Send Message'.";
        }
        return "Sorry, I can only answer basic questions about how to use this app. Try asking about profiles, posts, or messages.";
    };

    const handleSend = () => {
        if (!userInput.trim()) return;
        const userMessage: ChatMessage = { sender: 'user', text: userInput };
        const botResponse: ChatMessage = { sender: 'bot', text: getBotResponse(userInput) };

        setMessages(prev => [...prev, userMessage, botResponse]);
        setUserInput('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110"
                aria-label="Toggle help bot"
            >
                {isOpen ? <CloseIcon /> : <HelpIcon />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[500px] bg-gray-800 rounded-xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    <header className="p-4 bg-gray-900 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-white">Ember Help</h3>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         <div ref={chatEndRef}></div>
                    </div>
                    <footer className="p-4 bg-gray-900/50">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200"
                            />
                            <button onClick={handleSend} className="p-2 bg-orange-600 hover:bg-orange-700 rounded-full text-white transition disabled:bg-gray-600" disabled={!userInput.trim()}>
                                <SendIcon />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};
