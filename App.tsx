
import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';
import {
    UploadCloud, Download, AlertTriangle,
    LayoutDashboard, Calculator, BookOpen, Sparkles,
    ArrowRight, CheckCircle2, Trash2, Link as LinkIcon, Info, MessageSquare, Copy, Palette, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { FileUpload } from './components/FileUpload';
const Preview = lazy(() => import('./components/Preview').then(module => ({ default: module.Preview })));
const IncomeTracker = lazy(() => import('./components/IncomeTracker').then(module => ({ default: module.IncomeTracker })));
const Guide = lazy(() => import('./components/Guide').then(module => ({ default: module.Guide })));
const ProjectNotes = lazy(() => import('./components/ProjectNotes').then(module => ({ default: module.ProjectNotes })));
const DopamineDispenser = lazy(() => import('./components/DopamineDispenser').then(module => ({ default: module.DopamineDispenser })));
const CanvaMailModal = lazy(() => import('./components/CanvaMailModal').then(module => ({ default: module.CanvaMailModal })));

import { useSrtCleaner } from './hooks/useSrtCleaner';
import { useSecretClick } from './hooks/useSecretClick';

// --- Main Application ---
export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker' | 'guide' | 'notes' | 'canvas' | 'gallery';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');

    const [showCanvaModal, setShowCanvaModal] = useState<boolean>(false);
    
    // Admin Login State
    const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
    const [adminUser, setAdminUser] = useState<string>('');
    const [adminPass, setAdminPass] = useState<string>('');

    const handleAdminLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminUser === 'admin' && adminPass === 'admin') {
            sessionStorage.setItem('isAdmin', 'true');
            window.dispatchEvent(new Event('adminAuthChanged'));
            setShowAdminLogin(false);
            setAdminUser('');
            setAdminPass('');
        } else {
            alert('Invalid admin credentials');
        }
    };

    useEffect(() => {
        const hasSeenCanvaMail = localStorage.getItem('hasSeenCanvaMailNotice');
        if (!hasSeenCanvaMail) {
            setShowCanvaModal(true);
        }
    }, []);

    const handleCloseCanvaModal = () => {
        localStorage.setItem('hasSeenCanvaMailNotice', 'true');
        setShowCanvaModal(false);
    };

    const { loveEffects, handleSecretClick } = useSecretClick();
    const { 
        originalContent, cleanedContent, summary, foreignReport, 
        handleFileSelect: onFileSelect, handleDownload, resetCleaner 
    } = useSrtCleaner();

    const handleFileSelect = useCallback((content: string, name: string) => {
        onFileSelect(content, name);
        setAppState('preview');
    }, [onFileSelect]);

    const handleReset = () => {
        resetCleaner();
        setAppState('idle');
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300 relative overflow-hidden">
            {/* Love Effects */}
            {loveEffects.map(effect => (
                <div key={effect.id} className="fixed pointer-events-none animate-float-up text-pink-500 text-4xl z-50 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" style={{ left: effect.x - 20, top: effect.y - 20 }}>
                    ❤️
                </div>
            ))}

            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-blob"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-blob animation-delay-2000"></div>

            {activeView === 'canvas' ? (
                <div className="absolute inset-0 z-50 bg-[#09090b] flex flex-col">
                    <button 
                        onClick={() => setActiveView('cleaner')} 
                        className="fixed top-4 left-4 z-[60] p-3 sm:p-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full shadow-xl transition-all flex items-center justify-center group"
                        title="Back to App"
                    >
                        <ArrowLeft className="w-6 h-6 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1 w-full h-full min-h-0 relative z-10 flex flex-col">
                        <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div></div>}>
                            <ProjectNotes mode="canvas" fillParent={true} />
                        </Suspense>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
                    <header className="mb-12">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2">
                            Translator's Toolkit
                        </h1>
                    </div>

                    <div className="mt-6 flex justify-center w-full px-2 sm:px-0">
                        <div className="bg-zinc-900/40 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-zinc-800/50 flex w-full sm:w-auto justify-between sm:justify-center gap-1 sm:gap-2">
                            {([
                                { id: 'cleaner', label: 'Cleaner', icon: <LayoutDashboard className="w-4 h-4 sm:w-4 sm:h-4" /> },
                                { id: 'tracker', label: 'Tracker', icon: <Calculator className="w-4 h-4 sm:w-4 sm:h-4" /> },
                                { id: 'guide', label: 'Guide', icon: <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" /> },
                                { id: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4 sm:w-4 sm:h-4" /> }
                            ] as const).map(({ id, label, icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveView(id)}
                                    className={cn(
                                        "px-2 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none",
                                        activeView === id
                                            ? "bg-zinc-800 text-indigo-400 shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-zinc-700/50"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                    )}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>
                            <main>
                                <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div></div>}>
                                    <AnimatePresence mode="wait">
                                        {activeView === 'cleaner' && (
                                            <motion.div key="cleaner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                {appState === 'idle' ? <FileUpload onFileSelect={handleFileSelect} disabled={false} /> :
                                                    originalContent && cleanedContent && summary && foreignReport && (
                                                        <div className="space-y-8 animate-fade-in">
                                                            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/50 sticky top-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                                <h2 className="text-xl font-bold text-zinc-100">Review Changes</h2>
                                                                <div className="flex gap-3">
                                                                    <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg transition-colors">Clean Another</button>
                                                                    <button onClick={handleDownload} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center transition-all"><Download className="w-4 h-4 mr-2" /> Download</button>
                                                                </div>
                                                            </div>
                                                            <Preview originalContent={originalContent} cleanedContent={cleanedContent} summary={summary} foreignReport={foreignReport} />
                                                        </div>
                                                    )}
                                            </motion.div>
                                        )}
                                        {activeView === 'tracker' && (
                                            <motion.div key="tracker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <IncomeTracker />
                                            </motion.div>
                                        )}
                                        {activeView === 'guide' && (
                                            <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <Guide />
                                            </motion.div>
                                        )}
                                        {activeView === 'notes' && (
                                            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <ProjectNotes mode="text" />
                                            </motion.div>
                                        )}
                                        {/* {activeView === 'gallery' && (
                                            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <ProjectNotes mode="gallery" />
                                            </motion.div>
                                        )} */}
                                    </AnimatePresence>
                                </Suspense>
                            </main>
                <footer className="text-center mt-12 text-zinc-600 font-medium tracking-wide pb-12 relative z-20">
                    <p className="cursor-pointer hover:text-zinc-400 transition-colors inline-block" onClick={() => setShowAdminLogin(true)}>
                        Translator's Toolkit &copy; 2026
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                        Made for <span onClick={handleSecretClick} className="relative inline-block transition-colors duration-300 hover:text-pink-400 cursor-pointer group font-bold select-none py-1">
                            Thu Zue Zue San
                            <span className="demo2-heart1 absolute -top-1 left-[10%] text-pink-500 text-[10px] opacity-0 pointer-events-none">❤️</span>
                            <span className="demo2-heart2 absolute top-1 left-[40%] text-purple-500 text-[14px] opacity-0 pointer-events-none">💖</span>
                            <span className="demo2-heart3 absolute -top-2 left-[70%] text-rose-500 text-[12px] opacity-0 pointer-events-none">💕</span>
                        </span>
                    </p>
                </footer>
            </div>
            )}

            {/* Temporarily removed from UI
            <Suspense fallback={null}>
                <DopamineDispenser />
                <CanvaMailModal isOpen={showCanvaModal} onClose={handleCloseCanvaModal} />
            </Suspense>
            */}

            {showAdminLogin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                        <button 
                            onClick={() => setShowAdminLogin(false)} 
                            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-4">Admin Login</h3>
                        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                            <input 
                                autoFocus 
                                type="text" 
                                placeholder="Username" 
                                value={adminUser} 
                                onChange={e => setAdminUser(e.target.value)} 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-zinc-600" 
                            />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={adminPass} 
                                onChange={e => setAdminPass(e.target.value)} 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-zinc-600" 
                            />
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowAdminLogin(false)} className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg shadow-red-500/20">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
                    20% { transform: translateY(-20px) scale(1.2) rotate(-10deg); opacity: 1; }
                    80% { transform: translateY(-80px) scale(1) rotate(10deg); opacity: 1; }
                    100% { transform: translateY(-100px) scale(0.8) rotate(0deg); opacity: 0; }
                }
                .animate-float-up { animation: floatUp 1s ease-out forwards; }

                @keyframes floatHeart {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translateY(-5px) scale(1); filter: drop-shadow(0 0 5px rgba(236,72,153,0.8)); }
                    100% { transform: translateY(-25px) scale(0.5); opacity: 0; }
                }
                .group:hover .demo2-heart1 { animation: floatHeart 1.2s infinite ease-out; }
                .group:hover .demo2-heart2 { animation: floatHeart 1.4s infinite ease-out 0.2s; }
                .group:hover .demo2-heart3 { animation: floatHeart 1.3s infinite ease-out 0.4s; }
            `}</style>
        </div>
    );
}
