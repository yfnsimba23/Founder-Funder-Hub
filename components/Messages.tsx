import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UserProfile, Message, Conversation } from '../types';
import { getConversations, getMessages, sendMessage, getUserProfile } from '../services/firebase';
import { SendIcon } from './Icons';

interface MessagesProps {
    currentUser: UserProfile;
    initialTargetUserId: string | null;
    onNavigateToProfile: (uid: string) => void;
    resetMessageTarget: () => void;
}

export const Messages: React.FC<MessagesProps> = ({ currentUser, initialTargetUserId, onNavigateToProfile, resetMessageTarget }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        const unsubscribe = getConversations(currentUser.uid, setConversations);
        return () => unsubscribe();
    }, [currentUser.uid]);

    const selectConversation = useCallback((conv: Conversation) => {
        setSelectedConversation(conv);
    }, []);

    useEffect(() => {
        const handleInitialTarget = async () => {
            if (initialTargetUserId) {
                const existingConv = conversations.find(c => c.participants.some(p => p.uid === initialTargetUserId));
                if (existingConv) {
                    selectConversation(existingConv);
                } else {
                    const targetUser = await getUserProfile(initialTargetUserId);
                    if (targetUser) {
                        const newConv: Conversation = {
                            id: [currentUser.uid, targetUser.uid].sort().join('_'),
                            participants: [currentUser, targetUser],
                            lastMessage: null,
                        };
                        setSelectedConversation(newConv);
                    }
                }
                resetMessageTarget();
            }
        };
        if(conversations.length > 0 || initialTargetUserId) {
           handleInitialTarget();
        }
    }, [initialTargetUserId, conversations, currentUser, selectConversation, resetMessageTarget]);

    useEffect(() => {
        if (selectedConversation) {
            const unsubscribe = getMessages(selectedConversation.id, setMessages);
            return () => unsubscribe();
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedConversation) {
            await sendMessage(selectedConversation.id, currentUser.uid, newMessage);
            setNewMessage('');
            if (!conversations.some(c => c.id === selectedConversation.id)) {
                 // It's a new conversation, add it to the list locally until firebase updates
                 setConversations(prev => [selectedConversation, ...prev]);
            }
        }
    };

    const otherUser = selectedConversation?.participants.find(p => p.uid !== currentUser.uid);

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            <aside className="w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Conversations</h2>
                </div>
                <div className="overflow-y-auto">
                    {conversations.map(conv => {
                        const participant = conv.participants.find(p => p.uid !== currentUser.uid);
                        return (
                            <div
                                key={conv.id}
                                onClick={() => selectConversation(conv)}
                                className={`p-4 cursor-pointer flex items-center space-x-3 transition-colors ${selectedConversation?.id === conv.id ? 'bg-orange-600/30' : 'hover:bg-gray-700/50'}`}
                            >
                                <img src={participant?.photoURL || `https://picsum.photos/seed/${participant?.uid}/48`} alt={participant?.fullName} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold text-white">{participant?.fullName}</p>
                                    <p className="text-sm text-gray-400 truncate">{conv.lastMessage?.text}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>
            <main className="w-2/3 flex flex-col">
                {selectedConversation && otherUser ? (
                    <>
                        <header 
                            onClick={() => onNavigateToProfile(otherUser.uid)}
                            title={`View ${otherUser.fullName}'s profile`}
                            className="p-4 border-b border-gray-700 flex items-center space-x-3 bg-gray-800/70 cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                            <img src={otherUser.photoURL || `https://picsum.photos/seed/${otherUser.uid}/40`} alt={otherUser.fullName} className="w-10 h-10 rounded-full object-cover" />
                            <h3 className="text-lg font-bold text-white">{otherUser.fullName}</h3>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.uid ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-lg px-4 py-2 rounded-xl ${msg.senderId === currentUser.uid ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <footer className="p-4 bg-gray-900/50">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200"
                                />
                                <button type="submit" className="p-3 bg-orange-600 hover:bg-orange-700 rounded-full text-white transition disabled:bg-gray-600" disabled={!newMessage.trim()}>
                                    <SendIcon />
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <p>Select a conversation or start a new one from the Directories.</p>
                    </div>
                )}
            </main>
        </div>
    );
};