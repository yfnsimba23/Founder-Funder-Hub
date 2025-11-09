
import React, { useState } from 'react';

type CommunityTab = 'Discover' | 'Websites' | 'Internal Tools';

const discoverItems = [
    { title: "New AI Model Smashes Benchmarks", source: "TechCrunch", img: "https://picsum.photos/seed/ai/400/200" },
    { title: "The Future of Decentralized Finance", source: "CoinDesk", img: "https://picsum.photos/seed/defi/400/200" },
    { title: "Climate Tech Sees Record Investment in Q3", source: "Axios", img: "https://picsum.photos/seed/climate/400/200" },
    { title: "VCs Are Pouring Money Into Green Hydrogen", source: "Bloomberg", img: "https://picsum.photos/seed/green/400/200" },
    { title: "How to Build a Defensible SaaS Business", source: "First Round Review", img: "https://picsum.photos/seed/saas/400/200" },
    { title: "The Creator Economy is Entering a New Era", source: "The Information", img: "https://picsum.photos/seed/creator/400/200" },
];

const websites = [
    { name: "Y Combinator Library", url: "https://www.ycombinator.com/library" },
    { name: "Sequoia Capital Resources", url: "https://www.sequoiacap.com/build/" },
    { name: "First Round Review", url: "https://review.firstround.com/" },
    { name: "Andreessen Horowitz (a16z) Content", url: "https://a16z.com/content/" },
];

const internalTools = [
    { name: "Shared Google Drive", url: "https://drive.google.com" },
    { name: "Pitch Deck Uploader", url: "https://dropbox.com" },
    { name: "Program Slack Channel", url: "https://slack.com" },
    { name: "Residency Calendar", url: "https://calendar.google.com" },
];

const ResourceLink: React.FC<{ name: string, url: string }> = ({ name, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
        <p className="font-semibold text-white">{name}</p>
    </a>
);

export const Community: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('Discover');

    const renderContent = () => {
        switch (activeTab) {
            case 'Discover':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {discoverItems.map((item, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.source}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Websites':
                return <div className="space-y-4">{websites.map(item => <ResourceLink key={item.name} {...item} />)}</div>;
            case 'Internal Tools':
                 return <div className="space-y-4">{internalTools.map(item => <ResourceLink key={item.name} {...item} />)}</div>;
        }
    };
    
    return (
        <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
            <div className="flex space-x-1 mb-6 border-b border-gray-700">
                {(['Discover', 'Websites', 'Internal Tools'] as CommunityTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === tab ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};