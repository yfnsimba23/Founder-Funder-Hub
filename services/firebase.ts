import type { UserProfile, UserRole, Post, Message, Conversation } from '../types';

// --- MOCK DATABASE ---

let mockUsers: UserProfile[] = [
    { uid: '1', email: 'founder@test.com', role: 'Founder', fullName: 'Alex Founder', photoURL: 'https://picsum.photos/seed/1/200', startupName: 'Innovate AI', oneLinePitch: 'AI-powered solutions for modern businesses.', industry: 'AI', fundingStage: 'Seed', myAsk: 'Seeking connections with enterprise clients and strategic partners.', pitchDeckUrl: '#' },
    { uid: '2', email: 'funder@test.com', role: 'Funder', fullName: 'Bella Funder', photoURL: 'https://picsum.photos/seed/2/200', firmName: 'Capital Ventures', investmentThesis: 'Investing in disruptive, early-stage SaaS and FinTech companies.', preferredStage: 'Seed', whatIOffer: 'Extensive mentorship, operational support, and access to our network.' },
];

let mockPosts: Post[] = [];

let mockMessages: { [convId: string]: Message[] } = {};

let currentUser: UserProfile | null = null;
let authStateListener: (user: { uid: string } | null) => void = () => {};
let postListener: (posts: Post[]) => void = () => {};
let messageListeners: { [convId: string]: ((msgs: Message[]) => void) } = {};

// --- MOCK AUTHENTICATION ---

export const onAuthStateChanged = (callback: (user: { uid: string } | null) => void) => {
    authStateListener = callback;
    setTimeout(() => authStateListener(currentUser ? { uid: currentUser.uid } : null), 100);
    return () => { authStateListener = () => {}; };
};

export const signUp = async (email: string, password: string, role: UserRole): Promise<UserProfile> => {
    if (mockUsers.find(u => u.email === email)) throw new Error('Authentication error: Email already in use.');
    const uid = String(Date.now());
    const newUser: UserProfile = {
        uid, email, role,
        fullName: 'New User',
        photoURL: `https://picsum.photos/seed/${uid}/200`
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    authStateListener({ uid: newUser.uid });
    return newUser;
};

export const signIn = async (email: string, password: string): Promise<UserProfile> => {
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Authentication error: User not found.');
    currentUser = user;
    authStateListener({ uid: user.uid });
    return user;
};

export const signInWithGoogle = async (): Promise<UserProfile> => {
    const user = mockUsers.find(u => u.email === 'founder@test.com');
    if (!user) throw new Error("Mock Google user not found.");
    currentUser = user;
    authStateListener({ uid: user.uid });
    return user;
};

export const signInWithApple = async (): Promise<UserProfile> => {
    const user = mockUsers.find(u => u.email === 'funder@test.com');
    if (!user) throw new Error("Mock Apple user not found.");
    currentUser = user;
    authStateListener({ uid: user.uid });
    return user;
};

export const signOut = async (): Promise<void> => {
    currentUser = null;
    authStateListener(null);
};

// --- MOCK FIRESTORE / DATABASE ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    return mockUsers.find(u => u.uid === uid) || null;
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
    mockUsers = mockUsers.map(u => u.uid === uid ? { ...u, ...profileData } as UserProfile : u);
    if (currentUser?.uid === uid) {
// Fix: Corrected a typo in the type cast from `User-Profile` to `UserProfile`.
        currentUser = { ...currentUser, ...profileData } as UserProfile;
    }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    return [...mockUsers];
};

export const createPost = async (author: UserProfile, content: string): Promise<void> => {
    const newPost: Post = {
        id: `p${Date.now()}`,
        authorId: author.uid,
        author: {
            fullName: author.fullName,
            photoURL: author.photoURL,
            role: author.role,
        },
        content,
        timestamp: new Date(),
    };
    mockPosts.unshift(newPost);
    postListener([...mockPosts]);
};

export const getPosts = (callback: (posts: Post[]) => void) => {
    postListener = callback;
    setTimeout(() => callback([...mockPosts]), 100);
    return () => { postListener = () => {}; };
};

export const getConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
    const userConversations = Object.keys(mockMessages)
        .filter(key => key.split('_').includes(userId))
        .map(convId => {
            const participantIds = convId.split('_');
            const otherParticipantId = participantIds.find(id => id !== userId)!;
            const participants = [
                mockUsers.find(u => u.uid === userId)!,
                mockUsers.find(u => u.uid === otherParticipantId)!,
            ].filter(Boolean) as UserProfile[];

            if (participants.length < 2) return null;

            const messages = mockMessages[convId] || [];
            const lastMessage = messages.length > 0 ? messages.slice(-1)[0] : null;

            return { id: convId, participants, lastMessage };
        })
        .filter(Boolean) as Conversation[];
        
    setTimeout(() => callback(userConversations.sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0))), 100);
    return () => {};
};

export const getMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
    messageListeners[conversationId] = callback;
    setTimeout(() => callback(mockMessages[conversationId] || []), 100);
    return () => { delete messageListeners[conversationId]; };
};

export const sendMessage = async (conversationId: string, senderId: string, text: string): Promise<void> => {
    const newMessage: Message = {
        id: `m${Date.now()}`,
        senderId,
        text,
        timestamp: new Date(),
    };
    if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    if (messageListeners[conversationId]) {
        messageListeners[conversationId]([...mockMessages[conversationId]]);
    }
};