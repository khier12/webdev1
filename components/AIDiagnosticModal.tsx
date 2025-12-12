import React, { useState } from 'react';
import { X, Bot, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { diagnoseIssue } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceName: string) => void;
}

export const AIDiagnosticModal: React.FC<Props> = ({ isOpen, onClose, onSelectService }) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    const diagnosis = await diagnoseIssue(description);
    setResult(diagnosis);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6" />
            <h3 className="font-semibold text-lg">AI Technician</h3>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!result ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-indigo-800 text-sm font-medium">
                  Describe your problem, and I'll identify the repair you likely need.
                </p>
              </div>
              
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 h-32 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                placeholder="e.g. My iPhone fell in the pool and now the screen is flickering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button
                disabled={!description.trim() || isAnalyzing}
                onClick={handleAnalyze}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Diagnose Issue</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 text-slate-700 text-sm leading-relaxed shadow-sm">
                  {result}
                </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Step</p>
                  <button 
                    onClick={() => {
                      onSelectService('diagnosis'); // Simplified for demo, could parse generic intent
                      onClose();
                    }}
                    className="w-full group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 rounded-xl transition-all"
                  >
                    <span className="font-medium text-slate-900">Proceed with Booking</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                  </button>
                  <button 
                    onClick={() => setResult(null)}
                    className="w-full text-center py-2 text-sm text-slate-500 hover:text-slate-800"
                  >
                    Try another description
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};