import React, { useState, useEffect } from 'react';
import { Heart, X, ExternalLink } from 'lucide-react';

interface LetterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
                onClick={onClose} 
            />

            {/* Modal Card */}
            <div className="bg-zinc-950/95 border border-pink-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 max-w-sm w-full text-center space-y-4 animate-scale-in">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-900 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-pink-500/30 shadow-[0_0_25px_rgba(236,72,153,0.3)]">
                    <Heart className="w-8 h-8 text-pink-400 animate-pulse fill-pink-400/30" />
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                    Thank you thu thu, letter for you 💌
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    A special message and resource updates prepared just for you in the shared drive.
                </p>

                <div className="pt-2 space-y-2">
                    <a 
                        href="https://drive.google.com/drive/u/1/folders/1eerOQj3JVxm0bZSwr9LHubD1vnejCBn9" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 border border-pink-400/30 transition-all text-xs cursor-pointer"
                    >
                        <ExternalLink className="w-4 h-4" /> Open Letter in Google Drive
                    </a>

                    <button 
                        onClick={onClose}
                        className="block w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                        Dismiss for now
                    </button>
                </div>
            </div>
        </div>
    );
};
