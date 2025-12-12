import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate Authentication
    // In a real app, this would hit a backend API
    const mockUser: User = {
      id: `USR-${Date.now()}`,
      email: email,
      name: isLogin ? (email.split('@')[0]) : name // Fallback name for login demo
    };

    onLogin(mockUser);
    onClose();
    
    // Reset form
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
          <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all mt-4"
          >
            {isLogin ? <LogIn className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
