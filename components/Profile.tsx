import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { updateUserProfile, getUserProfile } from '../services/firebase';

interface ProfileProps {
    currentUser: UserProfile;
    onProfileUpdate: (user: UserProfile) => void;
    viewUserId?: string | null;
    onSendMessage: (userId: string) => void;
    resetViewUser: () => void;
}

const ProfileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {label: string, isTextarea?: boolean}> = ({ label, isTextarea, ...props }) => (
    <div>
        <label className="text-sm font-bold text-gray-400 block mb-2">{label}</label>
        {isTextarea ? (
             <textarea {...props} rows={3} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200" />
        ) : (
            <input {...props} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200" />
        )}
    </div>
);

const ProfileDisplayField: React.FC<{label: string, value?: string}> = ({ label, value }) => (
    value ? <div className="mb-4"><h3 className="text-sm text-gray-400">{label}</h3><p className="text-lg text-gray-200">{value}</p></div> : null
);

export const Profile: React.FC<ProfileProps> = ({ currentUser, onProfileUpdate, viewUserId, onSendMessage, resetViewUser }) => {
    const [profileData, setProfileData] = useState<Partial<UserProfile>>(currentUser);
    const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isMyProfile = !viewUserId || viewUserId === currentUser.uid;

    useEffect(() => {
        if (viewUserId) {
            const fetchUser = async () => {
                setIsLoading(true);
                const user = await getUserProfile(viewUserId);
                setViewedUser(user);
                setIsLoading(false);
            };
            fetchUser();
        } else {
            setViewedUser(null);
            setProfileData(currentUser);
        }
        
        return () => {
            if(!isMyProfile) resetViewUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewUserId, currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const updatedProfile = { ...currentUser, ...profileData };
        await updateUserProfile(currentUser.uid, updatedProfile);
        onProfileUpdate(updatedProfile);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    if (isLoading) return <div className="text-center p-8">Loading profile...</div>;

    const userToDisplay = isMyProfile ? currentUser : viewedUser;
    
    if(!userToDisplay) return <div className="text-center p-8">User not found.</div>

    return (
        <div className="max-w-3xl mx-auto">
            {isMyProfile ? (
                 <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-white">Edit Your Profile ({currentUser.role})</h2>
                    <ProfileInput label="Full Name" name="fullName" value={profileData.fullName || ''} onChange={handleInputChange} />
                    <ProfileInput label="Profile Picture URL" name="photoURL" value={profileData.photoURL || ''} onChange={handleInputChange} placeholder="https://picsum.photos/200" />

                    {currentUser.role === 'Founder' && (
                        <>
                            <ProfileInput label="Startup Name" name="startupName" value={profileData.startupName || ''} onChange={handleInputChange} />
                            <ProfileInput label="One-Line Pitch" name="oneLinePitch" value={profileData.oneLinePitch || ''} onChange={handleInputChange} />
                            <ProfileInput label="Industry (e.g., FinTech)" name="industry" value={profileData.industry || ''} onChange={handleInputChange} />
                            <ProfileInput label="Funding Stage (e.g., Pre-seed)" name="fundingStage" value={profileData.fundingStage || ''} onChange={handleInputChange} />
                            <ProfileInput label="Pitch Deck Link" name="pitchDeckUrl" value={profileData.pitchDeckUrl || ''} onChange={handleInputChange} />
                            <ProfileInput label="My Ask" name="myAsk" value={profileData.myAsk || ''} onChange={handleInputChange} isTextarea />
                        </>
                    )}

                    {currentUser.role === 'Funder' && (
                         <>
                            <ProfileInput label="Firm Name" name="firmName" value={profileData.firmName || ''} onChange={handleInputChange} />
                            <ProfileInput label="Investment Thesis" name="investmentThesis" value={profileData.investmentThesis || ''} onChange={handleInputChange} isTextarea />
                            <ProfileInput label="Preferred Stage (e.g., Seed, Series A)" name="preferredStage" value={profileData.preferredStage || ''} onChange={handleInputChange} />
                            <ProfileInput label="What I Offer" name="whatIOffer" value={profileData.whatIOffer || ''} onChange={handleInputChange} isTextarea />
                        </>
                    )}
                    
                    <div className="flex items-center justify-between">
                         <button type="submit" className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-bold transition">Save Changes</button>
                         {message && <p className="text-green-400">{message}</p>}
                    </div>
                </form>
            ) : (
                 <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                        <img src={userToDisplay.photoURL || `https://picsum.photos/seed/${userToDisplay.uid}/200`} alt={userToDisplay.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-white">{userToDisplay.fullName}</h2>
                            <p className="text-lg text-orange-400">{userToDisplay.role}</p>
                            {!isMyProfile && <button onClick={() => onSendMessage(userToDisplay.uid)} className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-bold transition">Send Message</button>}
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8">
                        {userToDisplay.role === 'Founder' ? (
                            <>
                                <ProfileDisplayField label="Startup" value={userToDisplay.startupName} />
                                <ProfileDisplayField label="Pitch" value={userToDisplay.oneLinePitch} />
                                <ProfileDisplayField label="Industry" value={userToDisplay.industry} />
                                <ProfileDisplayField label="Stage" value={userToDisplay.fundingStage} />
                                <ProfileDisplayField label="Ask" value={userToDisplay.myAsk} />
                                {userToDisplay.pitchDeckUrl && <a href={userToDisplay.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">View Pitch Deck</a>}
                            </>
                        ) : (
                            <>
                                <ProfileDisplayField label="Firm" value={userToDisplay.firmName} />
                                <ProfileDisplayField label="Thesis" value={userToDisplay.investmentThesis} />
                                <ProfileDisplayField label="Preferred Stage" value={userToDisplay.preferredStage} />
                                <ProfileDisplayField label="Offers" value={userToDisplay.whatIOffer} />
                            </>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};