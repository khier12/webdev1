import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { Review, User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'date'>) => void;
  user: User | null;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, user }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text) {
      onSubmit({ name: user.name, rating, text });
      setRating(5);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-semibold text-lg">Write a Review</h3>
            <p className="text-xs text-slate-300">Posting publicly as {user.name}</p>
          </div>
          <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Experience</label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              placeholder="Tell us how we did..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </form>
      </div>
    </div>
  );
};
