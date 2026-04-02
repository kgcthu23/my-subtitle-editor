import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded Supabase Credentials provided by user
const SUPABASE_URL = 'https://bnzfqmuxzmjlrinkujoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuemZxbXV4em1qbHJpbmt1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzY5MjcsImV4cCI6MjA5MDYxMjkyN30.T5MWNGeRCUeaW3aRjmYoZBwsakzFJpu5o0bArHn1SxY';
// Supabase REST endpoint to fetch the latest note and insert new ones
const API_URL = `${SUPABASE_URL}/rest/v1/project_notes`;

export function ProjectNotes() {
    const [notes, setNotes] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [lastFetch, setLastFetch] = useState<Date | null>(null);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            // Fetch the single most recently created note
            const response = await fetch(`${API_URL}?select=content&order=created_at.desc&limit=1`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setNotes(data[0].content || '');
                } else {
                    setNotes(''); // No notes exist yet
                }
            } else {
                console.error('Failed to fetch notes', response.status);
            }
            setLastFetch(new Date());
        } catch (err) {
            console.error('Error fetching notes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        // Removed polling to prevent overwriting user input automatically. 
        // Use the manual refresh button instead.
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            // Insert a new row with the latest content
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ content: notes }),
            });

            if (response.ok) {
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

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
            <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-emerald-400">
                            Scratch Pad
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">
                            When you have problem with anything, leave a message here.
                            {lastFetch && (
                                <span className="ml-2 text-zinc-500">
                                    Last synced: {lastFetch.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchNotes}
                            disabled={isLoading}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700/50 disabled:opacity-50"
                            title="Refresh Notes"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Notes
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type your notes here... They will be synced automatically when you hit save so everyone can see them."
                        className="w-full h-[500px] p-6 bg-zinc-950/50 text-zinc-100 rounded-xl border border-zinc-800/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none placeholder-zinc-600 shadow-inner block"
                        disabled={isLoading && notes === ''}
                    />

                    <AnimatePresence>
                        {saveStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 right-4 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-2 text-sm font-medium backdrop-blur-md"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Saved successfully to Supabase!
                            </motion.div>
                        )}

                        {saveStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 right-4 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 flex items-center gap-2 text-sm font-medium backdrop-blur-md"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Failed to save. Ensure your table exists!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
