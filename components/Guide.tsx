import React, { useState } from 'react';
import { Link as LinkIcon, MessageSquare, Film, Shield } from 'lucide-react';

export const Guide: React.FC = () => {
    const driveLink = "https://drive.google.com/drive/u/0/folders/1l0q5ayt7zNnJ4RADIA3maPGzoh-AgobU";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="bg-indigo-500/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <LinkIcon className="w-6 h-6" />
                    </span>
                    My Google Drive
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    <a href={driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center p-5 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 rounded-xl hover:from-indigo-900/40 hover:to-purple-900/40 transition-all duration-300 group border border-zinc-800/80 hover:border-indigo-500/30">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-3.5 rounded-xl mr-5 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-100 group-hover:text-indigo-400 transition-colors">Open Toolkit Drive</h3>
                            <p className="text-sm text-zinc-400 mt-1">Essential apps, installers, and tutorial documentation (Updated 2026)</p>
                        </div>
                    </a>
                </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Shield className="w-6 h-6" />
                    </span>
                    VPN
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    <a href="https://t.me/+WTuWX1N0ryszZjU9" target="_blank" rel="noopener noreferrer" className="flex items-center p-5 bg-gradient-to-r from-emerald-950/30 to-teal-950/30 rounded-xl hover:from-emerald-900/40 hover:to-teal-900/40 transition-all duration-300 group border border-zinc-800/80 hover:border-emerald-500/30">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-3.5 rounded-xl mr-5 shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.98 1.25-5.59 3.69-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.41-1.43-.87.03-.24.36-.49 1-.76 3.91-1.7 6.5-2.82 7.78-3.35 3.7-1.54 4.47-1.81 4.97-1.82.11 0 .36.03.49.14.11.09.15.22.16.32-.01.05-.01.16-.02.24z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-100 group-hover:text-emerald-400 transition-colors">Join this channel</h3>
                            <p className="text-sm text-zinc-400 mt-1">Telegram channel for VPN</p>
                        </div>
                    </a>
                </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <Film className="w-6 h-6" />
                    </span>
                    Helpful Resources
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">English Series and Movies</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <a href="https://www.cineby.gd/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-lg hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-sm font-bold text-zinc-300">
                                🍿 Cineby
                            </a>
                            <a href="https://www.fmovies.gd/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-lg hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-sm font-bold text-zinc-300">
                                🎬 FMovies
                            </a>
                            <a href="https://www.bitcine.app/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-lg hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-sm font-bold text-zinc-300">
                                📺 BitCine
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Anime</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <a href="https://animekai.to" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-lg hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-sm font-bold text-zinc-300">
                                🌸 AnimeKai
                            </a>
                            <a href="https://www.miruro.tv/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-lg hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-sm font-bold text-zinc-300">
                                ✨ Miruro
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
