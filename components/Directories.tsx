import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { getAllUsers } from '../services/firebase';

interface DirectoriesProps {
    onSendMessage: (userId: string) => void;
    onViewProfile: (userId: string) => void;
}

const UserCard: React.FC<{ user: UserProfile, onSendMessage: (userId: string) => void, onViewProfile: (userId: string) => void }> = ({ user, onSendMessage, onViewProfile }) => (
    <div className="p-5 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 flex flex-col justify-between">
        <div>
            <div className="flex items-center space-x-4 mb-4">
                <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/64`} alt={user.fullName} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h3 className="text-lg font-bold text-white">{user.fullName}</h3>
                    <p className="text-sm text-orange-400">{user.startupName || user.firmName}</p>
                </div>
            </div>
            {user.role === 'Founder' && <p className="text-gray-300 text-sm mb-1"><strong>Pitch:</strong> {user.oneLinePitch}</p>}
            {user.role === 'Funder' && <p className="text-gray-300 text-sm mb-1"><strong>Thesis:</strong> {user.investmentThesis}</p>}
        </div>
        <div className="w-full mt-4 flex items-center space-x-2">
            <button onClick={() => onViewProfile(user.uid)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition text-sm">
                View Profile
            </button>
            <button onClick={() => onSendMessage(user.uid)} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-semibold transition text-sm">
                Send Message
            </button>
        </div>
    </div>
);

export const Directories: React.FC<DirectoriesProps> = ({ onSendMessage, onViewProfile }) => {
    const [activeTab, setActiveTab] = useState<'Founders' | 'Funders'>('Founders');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [industryFilter, setIndustryFilter] = useState('');
    const [fundingStageFilter, setFundingStageFilter] = useState('');
    const [preferredStageFilter, setPreferredStageFilter] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const founders = users.filter(u => u.role === 'Founder');
    const funders = users.filter(u => u.role === 'Funder');

    const industries = [...new Set(founders.map(f => f.industry).filter(Boolean))] as string[];
    const fundingStages = [...new Set(founders.map(f => f.fundingStage).filter(Boolean))] as string[];
    const preferredStages = [...new Set(funders.map(f => f.preferredStage).filter(Boolean))] as string[];

    const filteredFounders = founders.filter(f => 
        (industryFilter ? f.industry === industryFilter : true) &&
        (fundingStageFilter ? f.fundingStage === fundingStageFilter : true) &&
        (f.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const filteredFunders = funders.filter(f =>
        (preferredStageFilter ? f.preferredStage === preferredStageFilter : true) &&
        (f.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const FilterDropdown: React.FC<{ options: string[], value: string, onChange: (val: string) => void, placeholder: string }> = ({ options, value, onChange, placeholder }) => (
        <select value={value} onChange={e => onChange(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white outline-none">
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    );

    return (
        <div>
            <div className="flex space-x-1 mb-6 border-b border-gray-700">
                <button onClick={() => setActiveTab('Founders')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'Founders' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>Founders</button>
                <button onClick={() => setActiveTab('Funders')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'Funders' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>Funders</button>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                {activeTab === 'Founders' && (
                    <>
                        <FilterDropdown options={industries} value={industryFilter} onChange={setIndustryFilter} placeholder="All Industries" />
                        <FilterDropdown options={fundingStages} value={fundingStageFilter} onChange={setFundingStageFilter} placeholder="All Stages" />
                    </>
                )}
                 {activeTab === 'Funders' && (
                    <FilterDropdown options={preferredStages} value={preferredStageFilter} onChange={setPreferredStageFilter} placeholder="All Preferred Stages" />
                )}
            </div>

            {loading ? <p>Loading directories...</p> : (
                <>
                    {activeTab === 'Founders' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFounders.map(user => <UserCard key={user.uid} user={user} onSendMessage={onSendMessage} onViewProfile={onViewProfile} />)}
                        </div>
                    )}
                    {activeTab === 'Funders' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {filteredFunders.map(user => <UserCard key={user.uid} user={user} onSendMessage={onSendMessage} onViewProfile={onViewProfile} />)}
                       </div>
                    )}
                </>
            )}
        </div>
    );
};