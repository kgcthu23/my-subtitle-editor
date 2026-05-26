import React, { useState, useCallback, lazy, Suspense } from 'react';
import { LayoutDashboard, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { FileUpload } from './components/FileUpload';
import { ToastContainer } from './components/Toast';
const Preview = lazy(() => import('./components/Preview').then(module => ({ default: module.Preview })));
const IncomeTracker = lazy(() => import('./components/IncomeTracker').then(module => ({ default: module.IncomeTracker })));

import { useSrtCleaner } from './hooks/useSrtCleaner';

export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');

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
        <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300 relative overflow-hidden">
            <ToastContainer />
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            {/* Radial Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#4f46e512,transparent_70%)] pointer-events-none"></div>
            <div className="absolute -top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
                <header className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-4 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                        SRT Subtitle Suite v2.0
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-indigo-200 to-indigo-400 pb-1">
                        Subtitle Toolkit
                    </h1>
                    <p className="mt-2.5 text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                        A utility for subtitle cleanup, formatting corrections, and translator income tracking.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <div className="bg-zinc-900/60 backdrop-blur-xl p-1 rounded-xl border border-zinc-800/80 flex gap-1 shadow-2xl">
                            {([
                                { id: 'cleaner', label: 'Subtitle Cleaner', icon: <LayoutDashboard className="w-4 h-4" /> },
                                { id: 'tracker', label: 'Income Tracker', icon: <Calculator className="w-4 h-4" /> }
                            ] as { id: AppView, label: string, icon: React.ReactNode }[]).map(({ id, label, icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveView(id)}
                                    className={cn(
                                        "px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
                                        activeView === id
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30"
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

                <main className="flex-1">
                    <Suspense fallback={
                        <div className="flex justify-center items-center py-24">
                            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                        </div>
                    }>
                        <AnimatePresence mode="wait">
                            {activeView === 'cleaner' && (
                                <motion.div 
                                    key="cleaner" 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -15 }} 
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                >
                                    {appState === 'idle' ? (
                                        <FileUpload onFileSelect={handleFileSelect} disabled={false} />
                                    ) : (
                                        originalContent && cleanedContent && summary && foreignReport && (
                                            <div className="space-y-6">
                                                <div className="bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <div className="text-left">
                                                        <h2 className="text-lg font-bold text-zinc-100">Review Changes</h2>
                                                        <p className="text-xs text-zinc-400 mt-0.5">Compare and download your cleaned subtitle file.</p>
                                                    </div>
                                                    <div className="flex gap-2.5 w-full sm:w-auto">
                                                        <button 
                                                            onClick={handleReset} 
                                                            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Clean Another
                                                        </button>
                                                        <button 
                                                            onClick={handleDownload} 
                                                            className="flex-1 sm:flex-none px-4.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                                        >
                                                            Download SRT
                                                        </button>
                                                    </div>
                                                </div>
                                                <Preview 
                                                    originalContent={originalContent} 
                                                    cleanedContent={cleanedContent} 
                                                    summary={summary} 
                                                    foreignReport={foreignReport} 
                                                />
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            )}
                            
                            {activeView === 'tracker' && (
                                <motion.div 
                                    key="tracker" 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -15 }} 
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                >
                                    <IncomeTracker />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Suspense>
                </main>

                <footer className="text-center mt-16 text-zinc-500 text-xs font-medium tracking-wide pb-8 border-t border-zinc-900 pt-8">
                    <p className="select-none">
                        Subtitle Toolkit &copy; 2026. Designed for quick subtitle refinement and productivity tracking.
                    </p>
                </footer>
            </div>
        </div>
    );
}
