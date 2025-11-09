import React, { useState } from 'react';
import type { UserProfile, UserRole } from '../types';
import { signUp, signIn, signInWithGoogle, signInWithApple } from '../services/firebase';
import { EmberLogo, GoogleIcon, AppleIcon } from './Icons';

interface AuthProps {
    onAuthSuccess: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Founder');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (authPromise: Promise<UserProfile>) => {
        setError('');
        try {
            const user = await authPromise;
            if (user) {
                onAuthSuccess(user);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            handleAuth(signIn(email, password));
        } else {
            handleAuth(signUp(email, password, role));
        }
    };
    
    const handleGoogleSignIn = () => handleAuth(signInWithGoogle());
    const handleAppleSignIn = () => handleAuth(signInWithApple());

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl">
                <div className="text-center">
                    <div className="inline-block">
                        <EmberLogo />
                    </div>
                    <h1 className="text-3xl font-bold text-white mt-2">Welcome to Ember</h1>
                    <p className="text-gray-400">{isLogin ? "Sign in to connect" : "Create your account"}</p>
                </div>

                {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                            required
                        />
                    </div>
                    
                    {isLogin && (
                         <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-orange-600 focus:ring-orange-500" />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-orange-400 hover:underline">Forgot password?</a>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">I am a...</label>
                            <div className="flex space-x-4">
                                <label className="flex-1">
                                    <input type="radio" name="role" value="Founder" checked={role === 'Founder'} onChange={() => setRole('Founder')} className="sr-only" />
                                    <div className={`p-3 text-center rounded-md cursor-pointer border-2 transition ${role === 'Founder' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>Founder</div>
                                </label>
                                <label className="flex-1">
                                    <input type="radio" name="role" value="Funder" checked={role === 'Funder'} onChange={() => setRole('Funder')} className="sr-only" />
                                    <div className={`p-3 text-center rounded-md cursor-pointer border-2 transition ${role === 'Funder' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>Funder</div>
                                </label>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full p-3 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-bold transition">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {isLogin && (
                    <>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition">
                                <GoogleIcon /> <span className="ml-3">Sign in with Google</span>
                            </button>
                             <button onClick={handleAppleSignIn} className="w-full flex items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition">
                                <AppleIcon /> <span className="ml-3">Sign in with Apple</span>
                            </button>
                        </div>
                    </>
                )}


                <p className="text-center text-sm text-gray-400 pt-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => {setIsLogin(!isLogin); setError('')}} className="font-medium text-orange-400 hover:underline ml-2">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};
