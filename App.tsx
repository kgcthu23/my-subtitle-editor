
import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';
import {
    UploadCloud, Download, AlertTriangle,
    LayoutDashboard, Calculator, BookOpen, Sparkles,
    ArrowRight, CheckCircle2, Trash2, Link as LinkIcon, Info, MessageSquare, Copy, Palette, ArrowLeft, Image as ImageIcon, Lock
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
const DopamineDispenser = lazy(() => import('./components/DopamineDispenser').then(module => ({ default: module.DopamineDispenser })));
const CanvaMailModal = lazy(() => import('./components/CanvaMailModal').then(module => ({ default: module.CanvaMailModal })));

import { useSrtCleaner } from './hooks/useSrtCleaner';

// --- Main Application ---
export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker' | 'guide' | 'notes' | 'canvas' | 'gallery';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');

    const [isAppUnlocked, setIsAppUnlocked] = useState(true);
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    const handleAppLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginUser === 'admin' && loginPass === '1234zzz') {
            setIsAppUnlocked(true);
            localStorage.setItem('appUnlocked', 'true');
            window.location.reload();
        } else {
            alert('Incorrect Credentials');
            setLoginPass('');
        }
    };

    const [showCanvaModal, setShowCanvaModal] = useState<boolean>(false);

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

    if (!isAppUnlocked) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-blob"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-blob animation-delay-2000"></div>

                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-800/50 w-full max-w-sm text-center relative z-10 animate-fade-in">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
                    <p className="text-zinc-400 text-sm mb-6">Please sign in to access the system.</p>
                    <form onSubmit={handleAppLogin} className="space-y-4">
                        <input
                            type="text"
                            autoFocus
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
                        />
                        <input
                            type="password"
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-mono tracking-widest"
                        />
                        <button 
                            type="submit" 
                            disabled={!loginUser || !loginPass}
                            className="w-full px-4 py-3 font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Enter System
                        </button>
                    </form>
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                    .animate-blob { animation: blob 7s infinite; }
                    .animation-delay-2000 { animation-delay: 2s; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300 relative overflow-hidden">
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
                            {/* Canvas notes temporarily removed */}
                            <div className="text-zinc-500 text-center mt-20">Canvas Component Removed</div>
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
                                { id: 'guide', label: 'Guide', icon: <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" /> }
                            ] as { id: AppView, label: string, icon: React.ReactNode }[]).map(({ id, label, icon }) => (
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

                                        {/* {activeView === 'gallery' && (
                                            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <ProjectNotes mode="gallery" />
                                            </motion.div>
                                        )} */}
                                    </AnimatePresence>
                                </Suspense>
                            </main>
                <footer className="text-center mt-12 text-zinc-600 font-medium tracking-wide pb-12 relative z-20">
                    <p className="inline-block select-none">
                        Translator's Toolkit &copy; 2026
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                        Made for <span className="relative inline-block transition-colors duration-300 hover:text-pink-400 group font-bold select-none py-1">
                            Thu Zue Zue San
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
