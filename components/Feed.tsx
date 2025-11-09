
import React, { useState, useEffect } from 'react';
import type { Post, UserProfile } from '../types';
import { createPost, getPosts } from '../services/firebase';

interface FeedProps {
    currentUser: UserProfile;
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    return (
        <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-900/50">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <img 
                        src={post.author.photoURL || `https://picsum.photos/seed/${post.authorId}/56`} 
                        alt={post.author.fullName} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-600" 
                    />
                    <div>
                        <p className="font-bold text-lg text-white">{post.author.fullName}</p>
                        <p className="text-sm font-semibold text-orange-400">{post.author.role}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0 pt-1">{post.timestamp.toLocaleString()}</p>
            </div>
            <p className="mt-4 text-gray-200 text-base whitespace-pre-wrap">{post.content}</p>
        </div>
    );
};

type PostFilter = 'All' | 'Founders' | 'Funders';

const FilterButton: React.FC<{
    label: PostFilter;
    activeFilter: PostFilter;
    setFilter: (filter: PostFilter) => void;
}> = ({ label, activeFilter, setFilter }) => {
    const isActive = activeFilter === label;
    return (
        <button
            onClick={() => setFilter(label)}
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
};

export const Feed: React.FC<FeedProps> = ({ currentUser }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<PostFilter>('All');

    useEffect(() => {
        const unsubscribe = getPosts(setPosts);
        return () => unsubscribe();
    }, []);

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsLoading(true);
        await createPost(currentUser, newPostContent);
        setNewPostContent('');
        setIsLoading(false);
    };

    const filteredPosts = posts
        .filter(post => {
            if (filter === 'All') return true;
            if (filter === 'Founders') return post.author.role === 'Founder';
            if (filter === 'Funders') return post.author.role === 'Funder';
            return true;
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <form onSubmit={handlePostSubmit} className="p-5 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 space-y-4">
                 <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.fullName}?`}
                    className="w-full p-3 h-24 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-200 resize-none"
                    disabled={isLoading}
                />
                <div className="text-right">
                    <button type="submit" className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-bold transition disabled:bg-gray-600" disabled={isLoading || !newPostContent.trim()}>
                        {isLoading ? 'Posting...' : 'Post Update'}
                    </button>
                </div>
            </form>

            <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
                <FilterButton label="All" activeFilter={filter} setFilter={setFilter} />
                <FilterButton label="Founders" activeFilter={filter} setFilter={setFilter} />
                <FilterButton label="Funders" activeFilter={filter} setFilter={setFilter} />
            </div>

            <div className="space-y-6">
                {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};
