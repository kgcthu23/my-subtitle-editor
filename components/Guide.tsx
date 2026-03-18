import React, { useState } from 'react';
import { Link as LinkIcon, MessageSquare, CheckCircle2, AlertTriangle, Copy, Film } from 'lucide-react';

export const Guide: React.FC = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [issue, setIssue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const hiddifyKeyVless = "vless://897b11cf-aa86-4fa0-9a6b-87d6c2a3cc5a@my.edumailme.com:443?alpn=h2%2Chttp%2F1.1&encryption=none&fp=chrome&host=my.edumailme.com&path=%2Fxray&security=tls&sni=my.edumailme.com&type=ws#SINGAPORE-50.00GB%F0%9F%93%8A-30D%E2%8F%B3";
    const hiddifyKeyVmess = "vmess://ewogICJhZGQiOiAibXkuZWR1bWFpbG1lLmNvbSIsCiAgImFsbG93SW5zZWN1cmUiOiBmYWxzZSwKICAiYWxwbiI6ICJoMixodHRwLzEuMSIsCiAgImZwIjogImNocm9tZSIsCiAgImhvc3QiOiAibXkuZWR1bWFpbG1lLmNvbSIsCiAgImlkIjogImRiYjNjNTUxLTFkNGQtNGRhMC1hNGFkLTQxYWU2NjY1ZjFlOCIsCiAgIm5ldCI6ICJ3cyIsCiAgInBhdGgiOiAiL3hyYXkiLAogICJwb3J0IjogMjA4MywKICAicHMiOiAiU0lOR0FQT1JFLTUwLjAwR0Lwn5OKLTMwROKPsyIsCiAgInNjeSI6ICJhdXRvIiwKICAic25pIjogIm15LmVkdW1haWxtZS5jb20iLAogICJ0bHMiOiAidGxzIiwKICAidHlwZSI6ICJub25lIiwKICAidiI6ICIyIgp9";
    const driveLink = "https://drive.google.com/drive/u/0/folders/1l0q5ayt7zNnJ4RADIA3maPGzoh-AgobU";

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!issue.trim()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Access Key for 'knightkryptonian@gmail.com'
        const accessKey = "d6be84f4-63ed-4347-b06c-fe7048ffa2ac";

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `Toolkit Issue Report: Anonymous`,
                    name: 'Anonymous',
                    message: issue,
                }),
            });
            const result = await response.json();
            if (result.success) {
                setSubmitStatus('success');
                setIssue('');
                setTimeout(() => setSubmitStatus('idle'), 5000);
            } else {
                console.error("Web3Forms Error:", result);
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <Film className="w-6 h-6" />
                    </span>
                    Helpful Resources
                </h2>

                <div className="mb-6 bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200/80">
                            <strong>Note:</strong> Most sites should be okay without VPN, try one by one. If none of them work, try with VPN
                        </p>
                    </div>
                </div>

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

            <div className="bg-amber-950/20 backdrop-blur-xl border border-amber-900/40 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors"></div>
                <h3 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2 relative z-10">
                    <MessageSquare className="w-6 h-6" />
                    Report an Issue
                </h3>
                <p className="text-amber-200/70 text-sm mb-5 relative z-10">
                    Encountering problems with the toolkit, VPN, or access? Describe the issue below so I can help.
                </p>
                <form onSubmit={handleReportSubmit} className="space-y-3 relative z-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="What's the issue?"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border border-amber-900/50 bg-black/40 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all disabled:opacity-50 text-sm pr-24 text-amber-100 placeholder:text-amber-700/50"
                            required
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`absolute right-1.5 top-1.5 bottom-1.5 px-6 text-amber-950 font-bold rounded-lg transition-colors flex items-center justify-center text-sm ${isSubmitting ? 'bg-amber-500/80 cursor-wait' : 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'}`}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-amber-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Send'}
                        </button>
                    </div>
                    {submitStatus === 'success' && (
                        <div className="text-sm text-emerald-400 font-bold animate-pulse mt-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Issue reported successfully!
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="text-sm text-rose-400 font-bold mt-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Failed to send report.
                        </div>
                    )}
                </form>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg className="w-48 h-48 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3 relative z-10">
                    <span className="bg-violet-500/10 text-violet-400 p-2.5 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </span>
                    Hiddify VPN Access
                </h2>

                <div className="mb-8 bg-violet-950/20 border border-violet-900/50 p-5 rounded-xl relative z-10 backdrop-blur-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-violet-300 mb-2">Download & Setup</h3>
                            <div className="text-sm text-violet-200/70 leading-relaxed space-y-4">
                                <p>Choose one of the links below to download <span className="text-violet-200 font-semibold">Hiddify VPN</span>. Installation is easy: just double-click the installer and accept everything.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <a href="https://limewire.com/d/6ZcJw#cMZPd7rz3B" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-xs font-bold text-zinc-300">
                                        🚀 LimeWire Mirror
                                    </a>
                                    <a href="https://t.me/+BfyZ73a7lbcyM2Rl" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-xs font-bold text-zinc-300">
                                        ✈️ Telegram Channel
                                    </a>
                                    <a href="https://hiddify.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-xs font-bold text-zinc-300 lg:col-span-1 sm:col-span-2">
                                        🌐 hiddify.com
                                    </a>
                                </div>
                                <p className="text-xs opacity-60 italic">Ensure you remove previous outdated keys before importing the new one below.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/80">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-zinc-200">Hiddify Key 1 (VLESS)</h3>
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-1 rounded">Latest Update</span>
                            </div>
                            <div className="text-xs text-amber-500/90 font-medium flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                                </svg>
                                <span>Refreshed: 2026-02-28</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <code className="flex-1 bg-black/60 border border-zinc-800/80 rounded-lg p-4 text-xs font-mono text-zinc-500 break-all h-24 overflow-y-auto custom-scrollbar select-all leading-relaxed shadow-inner">
                                {hiddifyKeyVless}
                            </code>
                            <button
                                onClick={() => handleCopy(hiddifyKeyVless, 'vless')}
                                className={`flex sm:flex-col flex-row items-center justify-center p-4 sm:px-6 sm:py-0 rounded-lg font-bold text-sm transition-all duration-300 border sm:min-w-[120px] gap-2 sm:gap-1.5 ${copiedId === 'vless' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'}`}
                            >
                                {copiedId === 'vless' ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 sm:mb-1" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 sm:w-5 sm:h-5 sm:mb-1" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/80">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-zinc-200">Hiddify Key 2 (VMESS)</h3>
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded">Alt Server</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <code className="flex-1 bg-black/60 border border-zinc-800/80 rounded-lg p-4 text-xs font-mono text-zinc-500 break-all h-24 overflow-y-auto custom-scrollbar select-all leading-relaxed shadow-inner">
                                {hiddifyKeyVmess}
                            </code>
                            <button
                                onClick={() => handleCopy(hiddifyKeyVmess, 'vmess')}
                                className={`flex sm:flex-col flex-row items-center justify-center p-4 sm:px-6 sm:py-0 rounded-lg font-bold text-sm transition-all duration-300 border sm:min-w-[120px] gap-2 sm:gap-1.5 ${copiedId === 'vmess' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'}`}
                            >
                                {copiedId === 'vmess' ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 sm:mb-1" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5 sm:mb-1" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
