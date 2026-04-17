import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Plus, Archive, Trash2, ArchiveRestore, Type, Palette, UploadCloud, Image as ImageIcon, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { SharedCanvas } from './SharedCanvas';

// Hardcoded Supabase Credentials provided by user
const SUPABASE_URL = 'https://bnzfqmuxzmjlrinkujoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuemZxbXV4em1qbHJpbmt1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzY5MjcsImV4cCI6MjA5MDYxMjkyN30.T5MWNGeRCUeaW3aRjmYoZBwsakzFJpu5o0bArHn1SxY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function ProjectNotes({ mode = 'text', fillParent = false }: { mode?: 'text' | 'canvas' | 'gallery', fillParent?: boolean }) {
    const [pages, setPages] = useState<Record<string, string>>({ "1": "" });
    const [activePage, setActivePage] = useState<string>(mode === 'canvas' ? "4" : "1");
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [storyIndex, setStoryIndex] = useState<number | null>(null);
    const [expiryHours, setExpiryHours] = useState<number | null>(24);
    
    // Typing indicator state
    const [remoteTyping, setRemoteTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const broadcastChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const lastDbStateRef = useRef<Record<string, string>>({ "1": "" });

    const activePages = Object.keys(pages).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_') && !k.startsWith('caption_') && !k.startsWith('expiry_')).sort((a, b) => Number(a) - Number(b));
    const archivedPages = Object.keys(pages).filter(k => k.startsWith('archived_')).sort((a, b) => Number(a.replace('archived_','')) - Number(b.replace('archived_','')));

    const sortedStoryPhotos = Object.keys(pages)
        .filter(k => k.startsWith('photo_'))
        .filter(k => {
            const expiry = pages[`expiry_${k}`];
            if (expiry && Date.now() > Number(expiry)) return false;
            return true;
        })
        .sort((a,b) => a.localeCompare(b));

    useEffect(() => {
        if (storyIndex === null) return;
        const timer = setTimeout(() => {
            if (storyIndex < sortedStoryPhotos.length - 1) {
                setStoryIndex(storyIndex + 1);
            } else {
                setStoryIndex(null);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [storyIndex, sortedStoryPhotos.length]);



    const fetchNotes = async (isInitialLoad = false) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('project_notes')
                .select('content')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Database error fetching notes:', error);
                throw error;
            }

            if (data && data.length > 0) {
                try {
                    const parsed = JSON.parse(data[0].content);
                    if (typeof parsed === 'object' && parsed !== null) {
                        setPages(parsed);
                        lastDbStateRef.current = parsed;
                        if (isInitialLoad) {
                            if (mode === 'canvas') {
                                setActivePage('4');
                            } else {
                                const activeKeys = Object.keys(parsed).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_') && !k.startsWith('caption_') && !k.startsWith('expiry_')).sort((a, b) => Number(a) - Number(b));
                                if (activeKeys.length > 0) {
                                    setActivePage(activeKeys[activeKeys.length - 1]);
                                }
                            }
                        }
                    } else {
                        setPages({ "1": data[0].content });
                    }
                } catch {
                    setPages({ "1": data[0].content || '' });
                }
            } else {
                setPages({ "1": "" });
            }
            setLastFetch(new Date());
        } catch (err) {
            console.error('Error fetching notes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes(true);
        
        // 1. Setup Postgres Changes for live updates
        const dbChannel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // Only checking for inserts since that's what handleSave does
                    schema: 'public',
                    table: 'project_notes',
                },
                (payload) => {
                    const newRecord = payload.new as { content: string };
                    try {
                        const parsed = JSON.parse(newRecord.content);
                        if (typeof parsed === 'object' && parsed !== null) {
                            setPages(prev => {
                                const merged = { ...parsed };
                                for (const key of Object.keys(prev)) {
                                    if (prev[key] !== lastDbStateRef.current[key]) {
                                        // We have local un-saved changes!
                                        if (parsed[key] !== lastDbStateRef.current[key] && !key.startsWith('canvas_') && !key.startsWith('photo_') && !key.startsWith('caption_')) {
                                            // Both changed text! Concatenate safely.
                                            // Avoid duplicating if parsed[key] already includes our text or vice versa.
                                            if (typeof parsed[key] === 'string' && typeof prev[key] === 'string') {
                                                merged[key] = parsed[key].includes(prev[key]) ? parsed[key] : parsed[key] + "\n\n" + prev[key];
                                            } else {
                                                merged[key] = prev[key];
                                            }
                                        } else {
                                            // Keep our un-saved change
                                            merged[key] = prev[key];
                                        }
                                    }
                                }
                                return merged;
                            });
                            lastDbStateRef.current = parsed;
                            setLastFetch(new Date());
                        }
                    } catch (e) {
                         // silently ignore
                    }
                }
            )
            .subscribe();

        // 2. Setup Broadcast channel for typing indicator
        broadcastChannel.current = supabase.channel('room-1', {
            config: {
                broadcast: { ack: false }
            }
        });

        broadcastChannel.current
            .on('broadcast', { event: 'typing' }, (payload) => {
                setRemoteTyping(true);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setRemoteTyping(false);
                }, 2000);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log("Subscribed to typing broadcasts")
                }
            });

        return () => {
            supabase.removeChannel(dbChannel);
            if (broadcastChannel.current) {
                supabase.removeChannel(broadcastChannel.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const sendTypingIndicator = () => {
        if (broadcastChannel.current) {
            broadcastChannel.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { page: activePage },
            });
        }
    };

    const handleSave = async (updatedPages?: Record<string, string>, isCanvasUpdate: boolean = false) => {
        let payloadData = updatedPages || pages;
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            // Pre-fetch latest to avoid wiping other tabs/data on concurrent edit or partial local state
            try {
                const { data } = await supabase.from('project_notes').select('content').order('created_at', { ascending: false }).limit(1);
                if (data && data.length > 0) {
                    const parsed = JSON.parse(data[0].content);
                    if (typeof parsed === 'object' && parsed !== null) {
                        const merged = { ...parsed };
                        for (const key of Object.keys(payloadData)) {
                            // If local payload differs from our last known DB state, it's a local edit
                            if (payloadData[key] !== lastDbStateRef.current[key]) {
                                merged[key] = payloadData[key];
                            }
                        }
                        // Handle deleted pages
                        for (const key of Object.keys(lastDbStateRef.current)) {
                             if (!(key in payloadData) && (key in parsed) && parsed[key] === lastDbStateRef.current[key]) {
                                 // We deleted it locally, and it hasn't changed remotely: so delete it from merged
                                 delete merged[key];
                             }
                        }
                        payloadData = merged;
                    }
                }
            } catch (e) {}

            const { error } = await supabase
                .from('project_notes')
                .insert([{ content: JSON.stringify(payloadData) }]);

            if (!error) {
                // Send Telegram notification (only for text saves)
                if (!isCanvasUpdate) {
                    try {
                        const TELEGRAM_BOT_TOKEN = "8487227254:AAHBAxAwLWwv6L_KESAygLm2DrTOphFpcCo";
                        const CHAT_IDS = ["5638537734", "5777458528"];
                        const timeString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Yangon', dateStyle: 'medium', timeStyle: 'short' });
                        
                        const textContent = payloadData[activePage] || "Blank";
                        const msg = `📝 Doodle Canva Updated (Page ${activePage})\n🕒 ${timeString}\n\n${textContent.slice(0, 500)}${textContent.length > 500 ? '...' : ''}`;
                        
                        for (const chatId of CHAT_IDS) {
                            try {
                                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ chat_id: chatId, text: msg }),
                                });
                            } catch (err) {}
                        }
                    } catch (notifyErr) {}
                }

                setSaveStatus('success');
                lastDbStateRef.current = payloadData;
                setLastFetch(new Date());
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error('Error saving notes:', err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCanvasSave = (dataUrl: string) => {
        const canvasKey = `canvas_${activePage}`;
        const updatedPages = { ...pages, [canvasKey]: dataUrl };
        setPages(updatedPages);
        handleSave(updatedPages, true);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                const photoKey = `photo_${activePage}_${Date.now()}`;
                const updatedPages = { ...pages, [photoKey]: dataUrl };
                if (expiryHours !== null) {
                    updatedPages[`expiry_${photoKey}`] = String(Date.now() + expiryHours * 3600 * 1000);
                }
                setPages(updatedPages);
                handleSave(updatedPages, true);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeletePhoto = (photoKey: string) => {
        if (window.confirm("Delete this photo?")) {
            const updatedPages = { ...pages };
            delete updatedPages[photoKey];
            delete updatedPages[`caption_${photoKey}`];
            delete updatedPages[`expiry_${photoKey}`];
            setPages(updatedPages);
            handleSave(updatedPages, true);
        }
    };

    return (
        <div className={mode === 'canvas' ? "flex-1 flex flex-col relative z-10 w-full h-full animate-fade-in" : (fillParent ? "flex-1 flex flex-col relative z-10 w-full min-h-0 animate-fade-in" : "max-w-4xl mx-auto space-y-6 animate-fade-in relative z-10 w-full px-4 sm:px-0")}>
            <div className={mode === 'canvas' ? "flex-1 flex flex-col min-h-0 w-full h-full" : (fillParent ? "flex-1 flex flex-col min-h-0 bg-zinc-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-800/50" : "bg-zinc-900/40 backdrop-blur-xl p-4 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50")}>
                {mode === 'text' && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-emerald-400 flex items-center gap-3">
                            {mode === 'text' ? 'Notes' : 'Doodle Canva'}
                            {remoteTyping && (
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1"
                                >
                                    <span className="flex gap-0.5">
                                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </span>
                                    typing...
                                </motion.span>
                            )}
                        </h2>
                        <div className="flex items-center gap-2 mt-3 mb-4 overflow-x-auto pb-2 flex-wrap sm:flex-nowrap">
                            {activePages.map(pageId => (
                                <button
                                    key={pageId}
                                    onClick={() => setActivePage(pageId)}
                                    className={`min-w-8 h-8 px-2 rounded text-sm font-bold transition-all ${activePage === pageId ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}
                                >
                                    {pageId}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    const keys = activePages.map(Number);
                                    const nextId = String(keys.length > 0 ? Math.max(...keys) + 1 : 1);
                                    setPages(prev => ({ ...prev, [nextId]: "" }));
                                    setActivePage(nextId);
                                }}
                                className="min-w-8 h-8 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 flex items-center justify-center transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {archivedPages.length > 0 && (
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                <span className="text-xs text-zinc-500 font-bold uppercase mr-1">Archived:</span>
                                {archivedPages.map(pageId => (
                                    <button
                                        key={pageId}
                                        onClick={() => setActivePage(pageId)}
                                        className={`min-w-8 h-8 px-2 rounded text-sm font-bold transition-all ${activePage === pageId ? 'bg-zinc-600 text-white shadow-[0_0_10px_rgba(82,82,91,0.3)]' : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'}`}
                                    >
                                        {pageId.replace('archived_', '')}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="text-zinc-400 text-sm mt-1">
                            When you have problem with anything, leave a message here. (Live synchronized)
                            {lastFetch && (
                                <span className="ml-2 text-zinc-500">
                                    Last synced: {lastFetch.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        
                        <div className="flex items-center gap-2">

                            
                            {mode === 'text' && (
                                <button
                                    onClick={() => handleSave()}
                                    disabled={isSaving || isLoading}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                )}

                <div className={mode === 'canvas' ? "flex-1 min-h-0 w-full h-full relative" : (fillParent ? "flex-1 min-h-0 relative flex flex-col" : "relative")}>
                    {mode === 'gallery' ? (
                        <div className="flex flex-col h-full md:h-[600px] bg-zinc-950/40 rounded-xl border border-zinc-800/50 p-6 shadow-inner">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-emerald-400">Photo Gallery</h3>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select 
                                        value={expiryHours || ''}
                                        onChange={(e) => setExpiryHours(e.target.value ? Number(e.target.value) : null)}
                                        className="bg-zinc-800 text-zinc-300 text-sm rounded-lg px-2 py-2 border border-zinc-700 outline-none hover:bg-zinc-700 transition w-1/3 sm:w-auto"
                                        title="Auto-delete after"
                                    >
                                        <option value="1">1 Hour</option>
                                        <option value="12">12 Hours</option>
                                        <option value="24">24 Hours</option>
                                        <option value="">Never</option>
                                    </select>
                                    <label className="flex-1 sm:flex-none justify-center px-4 py-2 cursor-pointer text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all whitespace-nowrap">
                                        <UploadCloud className="w-4 h-4" />
                                        Upload Photo
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                            </div>
                            {sortedStoryPhotos.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                                    <ImageIcon className="w-12 h-12 opacity-50" />
                                    <p>No photos uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                    {[...sortedStoryPhotos].reverse().map(photoKey => {
                                        const captionKey = `caption_${photoKey}`;
                                        return (
                                        <div key={photoKey} className="flex flex-col rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900 shadow-lg">
                                            <div 
                                                className="relative group aspect-square cursor-pointer overflow-hidden" 
                                                onClick={() => setStoryIndex(sortedStoryPhotos.indexOf(photoKey))}
                                            >
                                                    <img src={pages[photoKey]} alt="Gallery Item" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg">
                                                            View Full
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photoKey); }}
                                                        className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-all shadow-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                                                        title="Delete Photo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="p-2 bg-zinc-950">
                                                    <input
                                                        type="text"
                                                        placeholder="Add caption..."
                                                        value={pages[captionKey] || ''}
                                                        onChange={(e) => {
                                                            setPages(prev => ({ ...prev, [captionKey]: e.target.value }));
                                                        }}
                                                        onBlur={(e) => {
                                                            const updatedPages = { ...pages, [captionKey]: e.target.value };
                                                            handleSave(updatedPages, true);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') e.currentTarget.blur();
                                                        }}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    ) : mode === 'text' ? (
                        <div className="flex flex-col gap-4">

                            <textarea
                                value={pages[activePage] || ""}
                                onChange={(e) => {
                                    setPages(prev => ({ ...prev, [activePage]: e.target.value }));
                                    sendTypingIndicator();
                                }}
                                placeholder="Type a message..."
                                className="w-full h-[400px] p-6 bg-zinc-950/50 text-zinc-100 rounded-xl border border-zinc-800/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none placeholder-zinc-600 shadow-inner block"
                                disabled={isLoading}
                            />
                        </div>
                    ) : (
                        <SharedCanvas 
                             canvasData={pages[`canvas_${activePage}`]} 
                             onSave={handleCanvasSave} 
                             disabled={isLoading || isSaving}
                             fillParent={fillParent}
                        />
                    )}

                    <AnimatePresence>
                        {saveStatus === 'success' && mode === 'text' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 right-4 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-2 text-sm font-medium backdrop-blur-md pointer-events-none"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Saved successfully!
                            </motion.div>
                        )}
                        
                        {saveStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 right-4 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 flex items-center gap-2 text-sm font-medium backdrop-blur-md pointer-events-none"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Failed to save!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {storyIndex !== null && sortedStoryPhotos[storyIndex] && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 flex flex-col bg-black/95 backdrop-blur-xl touch-none select-none"
                    >
                        {/* Progress Bars */}
                        <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-220 flex gap-1 pointer-events-none">
                            {sortedStoryPhotos.map((key, i) => (
                                <div key={key} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: i < storyIndex ? '100%' : '0%' }}
                                        animate={{ width: i === storyIndex ? '100%' : i < storyIndex ? '100%' : '0%' }}
                                        transition={{ duration: i === storyIndex ? 5 : 0, ease: "linear" }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Top Controls */}
                        <button 
                            className="absolute top-10 right-4 text-zinc-300 hover:text-white p-2 z-220 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                            onClick={() => setStoryIndex(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        
                        {/* Tap & Swipe Area */}
                        <motion.div 
                            className="absolute inset-0 z-210 flex items-center justify-center cursor-pointer"
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.7}
                            onDragEnd={(e, info) => {
                                if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 500) {
                                    setStoryIndex(null);
                                }
                            }}
                            onClick={(e) => {
                                const clickX = e.clientX;
                                const width = window.innerWidth;
                                if (clickX < width * 0.3) {
                                    if (storyIndex > 0) setStoryIndex(storyIndex - 1);
                                } else {
                                    if (storyIndex < sortedStoryPhotos.length - 1) setStoryIndex(storyIndex + 1);
                                    else setStoryIndex(null);
                                }
                            }}
                        >
                            <motion.img 
                                key={sortedStoryPhotos[storyIndex]}
                                initial={{ opacity: 0.8, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={pages[sortedStoryPhotos[storyIndex]]} 
                                alt="Story View" 
                                className="max-w-full max-h-full object-contain pointer-events-none" 
                            />
                        </motion.div>

                        {/* Caption Overlay */}
                        <AnimatePresence mode="wait">
                            {pages[`caption_${sortedStoryPhotos[storyIndex]}`] && (
                                <motion.div 
                                    key={`cap_${storyIndex}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-0 left-0 right-0 p-8 pt-32 bg-linear-to-t from-black/90 via-black/60 to-transparent z-220 pointer-events-none"
                                >
                                    <p className="text-white text-center font-medium text-lg drop-shadow-md">
                                        {pages[`caption_${sortedStoryPhotos[storyIndex]}`]}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
