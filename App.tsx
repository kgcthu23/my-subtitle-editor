
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';
import {
    UploadCloud, Download, AlertTriangle,
    LayoutDashboard, Calculator, BookOpen, Sparkles,
    ArrowRight, CheckCircle2, Trash2, Link as LinkIcon, Info, MessageSquare, Copy
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Child Components ---

const FileUpload: React.FC<{ onFileSelect: (content: string, fileName: string) => void; disabled: boolean }> = ({ onFileSelect, disabled }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => onFileSelect(e.target?.result as string, file.name);
            reader.readAsText(file, 'UTF-8');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-zinc-900/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center p-14 hover:bg-zinc-800/60 transition-all duration-300 group shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                <UploadCloud className="w-10 h-10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <span className="mt-2 text-lg font-semibold text-zinc-200">Click to upload or drag and drop</span>
                <span className="text-sm text-zinc-500 mt-1">SRT files only</span>
                <input id="file-upload" type="file" className="sr-only" accept=".srt" onChange={handleFileChange} disabled={disabled} />
            </label>
        </div>
    );
};

const Preview: React.FC<{ originalContent: string; cleanedContent: string; summary: ChangeSummary; foreignReport: ForeignLanguageReport }> = ({ originalContent, cleanedContent, summary, foreignReport }) => {
    const originalLines = useMemo(() => originalContent.split('\n').slice(0, 15), [originalContent]);
    const cleanedLines = useMemo(() => cleanedContent.split('\n').slice(0, 15), [cleanedContent]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800/80 overflow-hidden flex flex-col">
                    <div className="bg-zinc-950/50 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-500"></div>Original</h3>
                    </div>
                    <pre className="text-xs text-zinc-400 overflow-x-auto p-4 flex-1">
                        {originalLines.map((line, i) => <div key={i} className="min-h-[1rem]">{line || ' '}</div>)}
                    </pre>
                </div>
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800/80 overflow-hidden flex flex-col relative before:absolute before:inset-0 before:rounded-xl before:border before:border-emerald-500/20 before:pointer-events-none">
                    <div className="bg-zinc-950/50 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>Cleaned</h3>
                    </div>
                    <pre className="text-xs text-emerald-300/90 overflow-x-auto p-4 flex-1">
                        {cleanedLines.map((line, i) => <div key={i} className="min-h-[1rem]">{line || ' '}</div>)}
                    </pre>
                </div>
            </div>
            <ChangeSummaryDisplay summary={summary} />
            <ForeignLanguageReportDisplay report={foreignReport} />
        </div>
    );
};

const ChangeSummaryDisplay: React.FC<{ summary: ChangeSummary }> = ({ summary }) => {
    const items = [
        { label: 'SRT Format Corrected', value: summary.formatFixes },
        { label: 'Backslashes Removed', value: summary.backslashesRemoved },
        { label: 'Timestamps Fixed', value: summary.timestampsFixed },
        { label: 'HTML Tags Fixed', value: summary.htmlTagsFixed },
        { label: 'Square Brackets Removed', value: summary.bracketsRemoved },
        { label: 'Parentheses Removed', value: summary.parensRemoved },
        { label: 'Speaker Labels Removed', value: summary.speakerLabelsRemoved },
        { label: 'Empty Hyphen Lines Removed', value: summary.hyphensRemoved },
        { label: 'Myanmar Characters Removed', value: summary.myanmarCharsRemoved },
        { label: 'Multi-dialogue Lines Split', value: summary.dialoguesSplit },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-zinc-800/50">
            <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Summary of Changes
            </h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.length > 0 ? items.map(item => (
                    <li key={item.label} className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-colors">
                        <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mb-1 group-hover:scale-105 transition-transform origin-left drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">{item.value}</span>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider leading-tight">{item.label}</span>
                    </li>
                )) : <p className="text-zinc-500 italic">No major changes detected.</p>}
            </ul>
        </div>
    );
};

const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    if (reportEntries.length === 0) return (
        <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 px-5 py-4 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-[0_4px_20px_rgba(16,185,129,0.05)]" role="alert">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">No foreign languages detected. All clean!</p>
        </div>
    );

    return (
        <div className="bg-amber-950/30 border border-amber-900/50 text-amber-200 p-5 rounded-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(245,158,11,0.05)]" role="alert">
            <div className="flex items-center mb-4"><AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" /><h3 className="font-bold text-amber-400">Foreign Language Detection</h3></div>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-amber-950/90 backdrop-blur-sm z-10 border-b border-amber-900/50">
                        <tr><th className="p-3 font-semibold text-amber-500/70">Line</th><th className="p-3 font-semibold text-amber-500/70">Detected</th><th className="p-3 font-semibold text-amber-500/70">Preview</th></tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/30">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum} className="hover:bg-amber-900/10 transition-colors">
                                <td className="p-3 font-mono text-amber-600">{lineNum}</td>
                                <td className="p-3 font-medium text-amber-300">{info.languages.join(', ')}</td>
                                <td className="p-3 font-mono text-amber-100/70 truncate max-w-[200px] sm:max-w-xs">{info.line}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const IncomeTracker: React.FC = () => {
    const [lines, setLines] = useState('');
    const [rate, setRate] = useState('');
    const [incomeData, setIncomeData] = useState<IncomeData>({});

    useEffect(() => {
        const savedData = localStorage.getItem('incomeTrackerData');
        if (savedData) try { setIncomeData(JSON.parse(savedData)); } catch (e) { }
    }, []);

    const currentMonthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }, []);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const numLines = parseInt(lines, 10);
        const numRate = parseFloat(rate);
        if (isNaN(numLines) || isNaN(numRate)) return;

        const updatedData = JSON.parse(JSON.stringify(incomeData));
        if (!updatedData[currentMonthKey]) updatedData[currentMonthKey] = { total: 0, entries: [] };

        const entry: IncomeEntry = { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), lines: numLines, rate: numRate, amount: numLines * numRate };
        updatedData[currentMonthKey].entries.unshift(entry);
        updatedData[currentMonthKey].total += entry.amount;

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
        setLines(''); setRate('');
    };

    const handleDeleteEntry = (id: string) => {
        const updatedData = JSON.parse(JSON.stringify(incomeData));
        const monthData = updatedData[currentMonthKey];
        if (!monthData) return;

        const entryIndex = monthData.entries.findIndex((e: IncomeEntry) => e.id === id);
        if (entryIndex === -1) return;

        const entry = monthData.entries[entryIndex];
        monthData.total -= entry.amount;
        monthData.entries.splice(entryIndex, 1);

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
    };

    const currentMonthData = incomeData[currentMonthKey] ?? { total: 0, entries: [] };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/50">
                <h3 className="text-lg font-bold mb-4 text-zinc-100 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-400" /> Add Entry</h3>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Lines</label>
                        <input type="number" value={lines} onChange={e => setLines(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 transition-all placeholder:text-zinc-600" placeholder="1000" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Rate (MMK)</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 transition-all placeholder:text-zinc-600" placeholder="1.5" required />
                    </div>
                    <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2">Add Income</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-zinc-800/80 gap-4">
                    <h3 className="text-xl font-bold text-zinc-100">Recent Entries</h3>
                    <div className="bg-emerald-500/10 px-5 py-3 rounded-xl border border-emerald-500/20 flex flex-col items-end sm:items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-1">This Month's Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{currentMonthData.total.toLocaleString()} MMK</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {currentMonthData.entries.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center p-4 bg-zinc-950/50 rounded-xl group hover:bg-zinc-800/80 transition-all border border-transparent hover:border-zinc-700/50">
                            <div>
                                <p className="font-bold text-zinc-200">{entry.lines.toLocaleString()} lines</p>
                                <p className="text-xs text-zinc-500 mt-1">{entry.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="font-bold text-emerald-400">{entry.amount.toLocaleString()} MMK</p>
                                <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-zinc-500 hover:text-rose-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg"
                                    title="Delete entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {currentMonthData.entries.length === 0 && (
                        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30">
                            <p className="text-zinc-500 font-medium">No entries this month.</p>
                            <p className="text-xs text-zinc-600 mt-2">Start typing lines above to track your income!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Guide: React.FC = () => {
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


// --- Main Application ---
export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker' | 'guide';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [cleanedContent, setCleanedContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('cleaned.srt');
    const [summary, setSummary] = useState<ChangeSummary | null>(null);
    const [foreignReport, setForeignReport] = useState<ForeignLanguageReport | null>(null);

    // Secret states
    const [secretClickCount, setSecretClickCount] = useState<number>(0);
    const [loveEffects, setLoveEffects] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        if (loveEffects.length > 0) {
            const timer = setTimeout(() => setLoveEffects(prev => prev.slice(1)), 1000);
            return () => clearTimeout(timer);
        }
    }, [loveEffects]);

    const handleSecretClick = (e: React.MouseEvent) => {
        const newCount = secretClickCount + 1;
        setLoveEffects(prev => [...prev, { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY }]);

        if (newCount >= 4) {
            setSecretClickCount(0);
            window.open('https://drive.google.com/drive/u/0/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju', '_blank');
        } else {
            setSecretClickCount(newCount);
        }
    };

    const handleFileSelect = useCallback((content: string, name: string) => {
        setOriginalContent(content);
        const cleaned = cleanSrtContent(content); setCleanedContent(cleaned);
        const summaryData = getChangeSummary(content); setSummary(summaryData);
        const reportData = detectForeignLanguages(cleaned); setForeignReport(reportData);
        setFileName(name.replace(/\.srt$/i, '') + '_cleaned.srt');
        setAppState('preview');
    }, []);

    const handleDownload = () => {
        if (!cleanedContent) return;
        const blob = new Blob([cleanedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = fileName;
        link.click(); URL.revokeObjectURL(url);
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
                <header className="mb-12">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2">
                            Translator's Toolkit
                        </h1>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="bg-zinc-900/40 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-zinc-800/50 inline-flex gap-2">
                            {([
                                { id: 'cleaner', label: 'Cleaner', icon: <LayoutDashboard className="w-4 h-4" /> },
                                { id: 'tracker', label: 'Tracker', icon: <Calculator className="w-4 h-4" /> },
                                { id: 'guide', label: 'Guide', icon: <BookOpen className="w-4 h-4" /> }
                            ] as const).map(({ id, label, icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveView(id)}
                                    className={cn(
                                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
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
                    {activeView === 'cleaner' && (
                        appState === 'idle' ? <FileUpload onFileSelect={handleFileSelect} disabled={false} /> :
                            originalContent && cleanedContent && summary && foreignReport && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/50 sticky top-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <h2 className="text-xl font-bold text-zinc-100">Review Changes</h2>
                                        <div className="flex gap-3">
                                            <button onClick={() => setAppState('idle')} className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg transition-colors">Clean Another</button>
                                            <button onClick={handleDownload} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center transition-all"><Download className="w-4 h-4 mr-2" /> Download</button>
                                        </div>
                                    </div>
                                    <Preview originalContent={originalContent} cleanedContent={cleanedContent} summary={summary} foreignReport={foreignReport} />
                                </div>
                            )
                    )}
                    {activeView === 'tracker' && <IncomeTracker />}
                    {activeView === 'guide' && <Guide />}
                </main>
                <footer className="text-center mt-12 text-m text-zinc-600 font-medium tracking-wide">
                    <p>Translator's Toolkit &copy; 2026</p>
                    <p className="mt-2 text-sm text-zinc-500">
                        Made for <span onClick={handleSecretClick} className="relative inline-block transition-colors duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 cursor-pointer group font-bold select-none">Thu Zue Zue San<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></span></span>
                    </p>
                </footer>
            </div>
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
            `}</style>
        </div>
    );
}
