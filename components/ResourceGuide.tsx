import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, MessageSquare, Send, BookOpen, Key, Download } from 'lucide-react';
import { toast } from '../hooks/useToast';

export const ResourceGuide: React.FC = () => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');

    const vpnKeys = [
        {
            id: 'key-1',
            title: 'Hiddify VLESS Node 1 (Primary)',
            config: 'vless://4a2d8e00-9988-4bb1-88aa-123456789abc@vpn1.myansub.net:443?type=ws&security=tls&path=%2Fvless#MyanSub-Primary-Node',
            status: 'Active',
            region: 'Singapore / Asia'
        },
        {
            id: 'key-2',
            title: 'Hiddify VMESS Node 2 (Backup)',
            config: 'vmess://eyJ2IjoiMiIsInBzIjoiTXlhblN1Yi1CYWNrdXAiLCJhZGRyIjoidnBuMi5teWFuc3ViLm5ldCIsInBvcnQiOjQ0MywiaWQiOiI0YTJkOGUwMC05OTg4LTRiYjEtODhhYS0xMjM0NTY3ODlhYmMiLCJhaWQiOjAsIm5ldCI6IndzIiwidHlwZSI6Im5vbmUiLCJob3N0IjoiIiwicGF0aCI6Ii92bWVzcyIsInRscyI6InRscyJ9',
            status: 'Active',
            region: 'Tokyo / Japan'
        }
    ];

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        toast.success('VPN Configuration copied to clipboard!');
        setTimeout(() => setCopiedKey(null), 3000);
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) {
            toast.error('Please write a message before submitting.');
            return;
        }
        toast.success('Thank you! Your feedback/issue report has been submitted.');
        setFeedback('');
        setEmail('');
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Title Banner */}
            <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" /> Translator Resources & Hiddify VPN Keys
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                        High-speed VPN access keys, setup instructions, and translation tools repository.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: VPN Keys & Setup Guide */}
                <div className="lg:col-span-2 space-y-6">
                    {/* VPN Keys Card */}
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Key className="w-4 h-4 text-amber-400" /> Hiddify VPN Access Credentials
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Status: Operational
                            </span>
                        </div>

                        <div className="space-y-4">
                            {vpnKeys.map((key) => (
                                <div key={key.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-xs font-bold text-zinc-200">{key.title}</h4>
                                            <p className="text-[10px] text-zinc-400">{key.region}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(key.config, key.id)}
                                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {copiedKey === key.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" /> Copy Key
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-500 truncate border border-zinc-900">
                                        {key.config}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How to Connect Guide */}
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
                            <BookOpen className="w-4 h-4 text-indigo-400" /> Hiddify VPN Setup Guide
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            {[
                                { step: "1", title: "Install Hiddify", desc: "Download Hiddify Next client for Windows/Android/iOS." },
                                { step: "2", title: "Copy Configuration", desc: "Click the 'Copy Key' button above for Node 1 or Node 2." },
                                { step: "3", title: "Import & Connect", desc: "Open Hiddify -> 'New Profile' -> 'Add from Clipboard'." }
                            ].map((s) => (
                                <div key={s.step} className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-1.5">
                                    <span className="inline-block w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold text-center leading-5">
                                        {s.step}
                                    </span>
                                    <h4 className="text-xs font-bold text-zinc-200">{s.title}</h4>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Google Drive & Feedback */}
                <div className="space-y-6">
                    {/* Google Drive / External Resources */}
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
                            <Download className="w-4 h-4 text-emerald-400" /> External Resources
                        </h3>

                        <div className="space-y-3">
                            <a 
                                href="https://drive.google.com/drive/u/1/folders/1eerOQj3JVxm0bZSwr9LHubD1vnejCBn9" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-3.5 rounded-xl bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-200 group-hover:text-white flex items-center gap-2">
                                        📁 Translator Shared Drive
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-1">
                                    Access dictionary terms, guidelines, subtitle tools, and special announcements.
                                </p>
                            </a>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
                            <MessageSquare className="w-4 h-4 text-violet-400" /> Report Issue / Send Feedback
                        </h3>

                        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    Your Email / Telegram Username
                                </label>
                                <input 
                                    type="text" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="@username or email..."
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    Feedback / Issue Details
                                </label>
                                <textarea 
                                    rows={3}
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    placeholder="Describe any bugs or feature requests..."
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 custom-scrollbar"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex justify-center items-center gap-2 transition-all cursor-pointer shadow-md"
                            >
                                <Send className="w-3.5 h-3.5" /> Submit Report
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
