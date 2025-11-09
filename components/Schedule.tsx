
import React, { useState, useEffect } from 'react';
import type { UserEvent } from '../types';

const residencyScheduleItems = [
    { week: 1, title: "Kickoff & Introductions", description: "Meet the cohort, program leads, and set your goals for the residency." },
    { week: 2, title: "Pitch Deck Workshop", description: "Deep dive into crafting a compelling narrative and designing an effective deck." },
    { week: 3, title: "Go-to-Market Strategy", description: "Sessions on identifying your ideal customer, channel strategy, and initial sales." },
    { week: 4, title: "Funder Roundtables", description: "Small group sessions with VCs and angel investors for feedback and networking." },
    { week: 5, title: "Product & Engineering Scalability", description: "Technical workshops on building for scale and reliability." },
    { week: 6, title: "Term Sheet Negotiations", description: "Legal and practical advice on navigating your first term sheet." },
    { week: 7, title: "Practice Pitch Day", description: "Internal pitch day to hone your presentation with peer feedback." },
    { week: 8, title: "Demo Day", description: "Final presentations to a curated audience of investors." },
];

const LOCAL_STORAGE_KEY = 'ember-user-events';

export const Schedule: React.FC = () => {
    const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        try {
            const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedEvents) {
                setMyEvents(JSON.parse(storedEvents));
            }
        } catch (error) {
            console.error("Failed to load events from local storage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(myEvents));
        } catch (error) {
            console.error("Failed to save events to local storage", error);
        }
    }, [myEvents]);

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) {
            alert('Please fill in at least title, date, and time.');
            return;
        }
        const newEvent: UserEvent = {
            id: String(Date.now()),
            title,
            date,
            time,
            description,
        };
        setMyEvents(prevEvents => [...prevEvents, newEvent]);
        setTitle('');
        setDate('');
        setTime('');
        setDescription('');
    };
    
    const handleDeleteEvent = (eventId: string) => {
        setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    };

    const handleClearAllEvents = () => {
        if (window.confirm('Are you sure you want to delete all your personal events? This cannot be undone.')) {
            setMyEvents([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const sortedUserEvents = [...myEvents].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Add a Personal Event</h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                    <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200" />
                    <div className="flex space-x-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200" />
                    </div>
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 h-24 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200 resize-none" />
                    <button type="submit" className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-bold transition">Add Event</button>
                </form>
            </div>

            {myEvents.length > 0 && (
                <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">My Events</h2>
                        <button onClick={handleClearAllEvents} className="text-sm bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition">
                            Clear All
                        </button>
                    </div>
                     <div className="space-y-4">
                        {sortedUserEvents.map(event => (
                            <div key={event.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                        <p className="text-orange-400 font-semibold">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {event.time}</p>
                                        <p className="text-gray-300 mt-2">{event.description}</p>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(event.id)} className="text-sm bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition">Delete</button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
            
            <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Residency Schedule</h2>
                <div className="space-y-6">
                    {residencyScheduleItems.map(item => (
                        <div key={item.week} className="flex space-x-6 items-start">
                            <div className="flex-shrink-0 w-16 text-center">
                                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto">
                                    {item.week}
                                </div>
                                <p className="text-gray-400 font-semibold mt-1">Week</p>
                            </div>
                            <div className="border-l-2 border-gray-700 pl-6 flex-1">
                                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                <p className="text-gray-300 mt-1">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};