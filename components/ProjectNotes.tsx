import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Plus, Archive, Trash2, ArchiveRestore, Type, Palette, UploadCloud, Image as ImageIcon } from 'lucide-react';
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
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Typing indicator state
    const [remoteTyping, setRemoteTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const broadcastChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        const checkAuth = () => setIsAdmin(sessionStorage.getItem('isAdmin') === 'true');
        checkAuth(); // Check initial state
        window.addEventListener('adminAuthChanged', checkAuth);
        return () => window.removeEventListener('adminAuthChanged', checkAuth);
    }, []);

    const activePages = Object.keys(pages).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_')).sort((a, b) => Number(a) - Number(b));
    const archivedPages = Object.keys(pages).filter(k => k.startsWith('archived_')).sort((a, b) => Number(a.replace('archived_','')) - Number(b.replace('archived_','')));

    const handleArchive = () => {
        setPages(prev => {
            const next = { ...prev };
            next[`archived_${activePage}`] = next[activePage];
            delete next[activePage];
            
            // Move canvas too if it exists
            if (next[`canvas_${activePage}`]) {
                 next[`canvas_archived_${activePage}`] = next[`canvas_${activePage}`];
                 delete next[`canvas_${activePage}`];
            }
            return next;
        });
        setActivePage(`archived_${activePage}`);
    };

    const handleUnarchive = () => {
        const originalId = activePage.replace('archived_', '');
        let newId = originalId;
        const keys = Object.keys(pages).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_')).map(Number);
        if (pages[newId] !== undefined) {
            newId = String(keys.length > 0 ? Math.max(...keys) + 1 : 1);
        }
        setPages(prev => {
            const next = { ...prev };
            next[newId] = next[activePage];
            delete next[activePage];
            
            if (next[`canvas_${activePage}`]) {
                 next[`canvas_${newId}`] = next[`canvas_${activePage}`];
                 delete next[`canvas_${activePage}`];
            }
            return next;
        });
        setActivePage(newId);
    };

    const handleDelete = () => {
        if (window.confirm("Delete this page permanently? This action cannot be undone.")) {
            const nextPages = { ...pages };
            delete nextPages[activePage];
            delete nextPages[`canvas_${activePage}`]; // delete doodle too
            
            const remainingActive = Object.keys(nextPages).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_')).sort((a,b) => Number(a) - Number(b));
            const remainingArchived = Object.keys(nextPages).filter(k => k.startsWith('archived_'));
            
            if (remainingActive.length === 0 && remainingArchived.length === 0) {
                nextPages["1"] = "";
                setActivePage("1");
            } else if (remainingActive.length > 0) {
                setActivePage(remainingActive[remainingActive.length - 1]);
            } else {
                setActivePage(remainingArchived[0]);
            }
            setPages(nextPages);
        }
    };

    const fetchNotes = async (isInitialLoad = false) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('project_notes')
                .select('content')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                try {
                    const parsed = JSON.parse(data[0].content);
                    if (typeof parsed === 'object' && parsed !== null) {
                        setPages(parsed);
                        if (isInitialLoad) {
                            if (mode === 'canvas') {
                                setActivePage('4');
                            } else {
                                const activeKeys = Object.keys(parsed).filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_')).sort((a, b) => Number(a) - Number(b));
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
                            setPages(parsed);
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
        const payloadData = updatedPages || pages;
        setIsSaving(true);
        setSaveStatus('idle');
        try {
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

                        {archivedPages.length > 0 && isAdmin && (
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
                            {isAdmin && (
                                <div className="flex items-center gap-2 mr-2 border-r border-zinc-800 pr-4">
                                    {activePage.startsWith('archived_') ? (
                                        <button
                                            onClick={handleUnarchive}
                                            className="p-2 text-zinc-400 hover:text-emerald-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700/50"
                                            title="Unarchive Page"
                                        >
                                            <ArchiveRestore className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleArchive}
                                            className="p-2 text-zinc-400 hover:text-amber-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700/50"
                                            title="Archive Page"
                                        >
                                            <Archive className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700/50"
                                        title="Delete permanently"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            
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
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-emerald-400">Photo Gallery</h3>
                                <label className="px-4 py-2 cursor-pointer text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
                                    <UploadCloud className="w-4 h-4" />
                                    Upload Photo
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            {Object.keys(pages).filter(k => k.startsWith('photo_')).length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                                    <ImageIcon className="w-12 h-12 opacity-50" />
                                    <p>No photos uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                    {Object.keys(pages)
                                        .filter(k => k.startsWith('photo_'))
                                        .sort((a,b) => b.localeCompare(a))
                                        .map(photoKey => (
                                            <div key={photoKey} className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-700/50 bg-zinc-900 shadow-lg">
                                                <img src={pages[photoKey]} alt="Gallery Item" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                                    <a href={pages[photoKey]} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all shadow-xl hover:scale-105">
                                                        View Full
                                                    </a>
                                                    <button 
                                                        onClick={() => handleDeletePhoto(photoKey)}
                                                        className="px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-all shadow-xl hover:scale-105"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
        </div>
    );
}
