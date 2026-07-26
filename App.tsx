import React, { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, AppView } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { Preview } from './components/Preview';
import { ToastContainer } from './components/Toast';
import { useSrtCleaner } from './hooks/useSrtCleaner';

const IncomeTracker = lazy(() => import('./components/IncomeTracker').then(m => ({ default: m.IncomeTracker })));

export default function App() {
    type AppState = 'idle' | 'preview';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');

    const { 
        files,
        activeFileIndex,
        setActiveFileIndex,
        isCleaned,
        options,
        updateOptions,
        handleMultipleFilesSelect: onFilesSelect, 
        loadSampleSrt: onLoadSample,
        downloadSingleFile, 
        downloadAllFiles,
        resetCleaner 
    } = useSrtCleaner();

    const handleFilesSelect = useCallback((rawFiles: { name: string; content: string }[]) => {
        onFilesSelect(rawFiles);
        setAppState('preview');
    }, [onFilesSelect]);

    const handleLoadSample = useCallback(() => {
        onLoadSample();
        setAppState('preview');
    }, [onLoadSample]);

    const handleReset = () => {
        resetCleaner();
        setAppState('idle');
    };

    return (
        <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300 relative overflow-x-hidden flex flex-col">
            <ToastContainer />

            {/* Background Tech Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            
            {/* Ambient HSL Radial Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#4f46e518,transparent_70%)] pointer-events-none"></div>
            <div className="fixed -top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[160px] pointer-events-none"></div>

            {/* Navbar */}
            <Navbar activeView={activeView} setActiveView={setActiveView} />

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <Suspense fallback={
                    <div className="flex justify-center items-center py-32">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-indigo-400/10 animate-ping"></div>
                        </div>
                    </div>
                }>
                    <AnimatePresence mode="wait">
                        {activeView === 'cleaner' && (
                            <motion.div 
                                key="cleaner" 
                                initial={{ opacity: 0, y: 12 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -12 }} 
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                {appState === 'idle' || !isCleaned ? (
                                    <FileUpload 
                                        onFilesSelect={handleFilesSelect} 
                                        onLoadSample={handleLoadSample} 
                                        disabled={false} 
                                    />
                                ) : (
                                    <Preview 
                                        files={files}
                                        activeFileIndex={activeFileIndex}
                                        setActiveFileIndex={setActiveFileIndex}
                                        options={options}
                                        onOptionsChange={updateOptions}
                                        onReset={handleReset}
                                        onDownloadSingle={downloadSingleFile}
                                        onDownloadAll={downloadAllFiles}
                                    />
                                )}
                            </motion.div>
                        )}
                        
                        {activeView === 'tracker' && (
                            <motion.div 
                                key="tracker" 
                                initial={{ opacity: 0, y: 12 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -12 }} 
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                <IncomeTracker />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Suspense>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center text-zinc-500 text-xs font-medium tracking-wide py-8 border-t border-zinc-900 bg-[#030712]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="select-none text-zinc-400">
                        MyanSub Cleaner &copy; {new Date().getFullYear()}. Crafted for subtitle translators.
                    </p>
                    <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                        <span>Client-side Privacy Guaranteed</span>
                        <span>&middot;</span>
                        <a 
                            href="https://github.com/kgcthu23/myansub-cleaner" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                        >
                            GitHub Source
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
