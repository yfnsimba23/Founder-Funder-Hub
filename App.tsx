import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from './components/Auth';
import { Feed } from './components/Feed';
import { Messages } from './components/Messages';
import { Directories } from './components/Directories';
import { Community } from './components/Community';
import { Schedule } from './components/Schedule';
import { Profile } from './components/Profile';
import { HelpBot } from './components/HelpBot';
import { EmberLogo, FeedIcon, MessageIcon, DirectoryIcon, CommunityIcon, ScheduleIcon, ProfileIcon } from './components/Icons';
import type { UserProfile } from './types';
import { onAuthStateChanged, signOut, getUserProfile } from './services/firebase';

type Page = 'feed' | 'messages' | 'directories' | 'community' | 'schedule' | 'profile';

const App: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('feed');
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const userProfile = await getUserProfile(firebaseUser.uid);
                setUser(userProfile);
                if (!userProfile?.fullName) {
                    setCurrentPage('profile');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        setCurrentPage('feed');
    };

    const handleSendMessage = useCallback((userId: string) => {
        setActiveUserId(userId);
        setCurrentPage('messages');
    }, []);

    const handleViewProfile = useCallback((userId: string) => {
        setActiveUserId(userId);
        setCurrentPage('profile');
    }, []);

    const resetActiveUser = useCallback(() => {
        setActiveUserId(null);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'feed':
                return <Feed currentUser={user!} />;
            case 'messages':
                return <Messages currentUser={user!} initialTargetUserId={activeUserId} onNavigateToProfile={(uid) => { setActiveUserId(uid); setCurrentPage('profile');}} resetMessageTarget={resetActiveUser} />;
            case 'directories':
                return <Directories onSendMessage={handleSendMessage} onViewProfile={handleViewProfile} />;
            case 'community':
                return <Community />;
            case 'schedule':
                return <Schedule />;
            case 'profile':
                 return <Profile currentUser={user!} onProfileUpdate={setUser} viewUserId={activeUserId} onSendMessage={handleSendMessage} resetViewUser={resetActiveUser} />;
            default:
                return <Feed currentUser={user!} />;
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">
                <div className="app-background"></div>
                Loading Ember...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-200 font-sans">
            <div className="app-background"></div>
            {!user ? (
                <Auth onAuthSuccess={setUser} />
            ) : (
                <>
                    <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} handleSignOut={handleSignOut} />
                    <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                        {renderPage()}
                    </main>
                    <HelpBot />
                </>
            )}
        </div>
    );
};

interface NavbarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    handleSignOut: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, handleSignOut }) => {
    const navItems: { id: Page, label: string, icon: React.ReactNode }[] = [
        { id: 'feed', label: 'Feed', icon: <FeedIcon /> },
        { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
        { id: 'directories', label: 'Directories', icon: <DirectoryIcon /> },
        { id: 'community', label: 'Community', icon: <CommunityIcon /> },
        { id: 'schedule', label: 'Schedule', icon: <ScheduleIcon /> },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-b border-gray-800 z-50">
            <nav className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex-shrink-0 flex items-center space-x-2 text-white">
                           <EmberLogo />
                           <span className="font-bold text-xl">Ember</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                           {navItems.map(item => (
                                <NavItem key={item.id} icon={item.icon} label={item.label} isActive={currentPage === item.id} onClick={() => setCurrentPage(item.id)} />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       <NavItem icon={<ProfileIcon />} label="My Profile" isActive={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
                        <button onClick={handleSignOut} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Sign Out</button>
                    </div>
                </div>
                 <div className="md:hidden flex items-center justify-around pb-2">
                    {navItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} isActive={currentPage === item.id} onClick={() => setCurrentPage(item.id)} />
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default App;