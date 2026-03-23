import React from 'react';

export const CanvaMailModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-zinc-900/90 border border-zinc-800/80 p-8 rounded-2xl shadow-2xl relative z-10 max-w-sm w-full animate-fade-in text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">Canva Mail Notice</h3>
                <p className="text-sm text-zinc-400 mb-6">hey u need to accept canva mail from gmail app ... click here to see how to know if it's working or not</p>
                <a
                    href="https://drive.google.com/file/d/1vrfL6M50kJ84BeNSQjx8s_sSf7hK1SR0/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 mb-4"
                >
                    Click Here
                </a>
                <button
                    onClick={onClose}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};
