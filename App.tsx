import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';

// SVG Icons
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const WarningIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const HelpIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

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
             <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-sky-400/50 dark:border-sky-500/60 flex flex-col items-center justify-center p-12 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors duration-300">
                <UploadIcon />
                <span className="mt-2 text-base font-medium text-slate-600 dark:text-slate-300">Click to upload or drag and drop</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">SRT files only</span>
                <input id="file-upload" type="file" className="sr-only" accept=".srt" onChange={handleFileChange} disabled={disabled}/>
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
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Original</h3>
                    <pre className="text-xs text-slate-600 dark:text-slate-300 overflow-x-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                        {originalLines.map((line, i) => <div key={i}>{line || '[EMPTY LINE]'}</div>)}
                    </pre>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Cleaned</h3>
                    <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        {cleanedLines.map((line, i) => <div key={i}>{line || '[EMPTY LINE]'}</div>)}
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Summary of Changes</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.length > 0 ? items.map(item => (
                    <li key={item.label} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                        <span className="block text-xl font-bold text-sky-600 dark:text-sky-400">{item.value}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </li>
                )) : <p className="text-slate-500">No major changes detected.</p>}
            </ul>
        </div>
    );
};

const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    if (reportEntries.length === 0) return (
        <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-r-lg" role="alert">
            <p className="font-bold">No foreign languages detected.</p>
        </div>
    );

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
             <div className="flex items-center"><WarningIcon /><div><p className="font-bold">Foreign Language Detection</p></div></div>
            <div className="mt-4 max-h-60 overflow-y-auto pr-2">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-yellow-100 dark:bg-yellow-800/50"><tr><th className="p-2">Line</th><th className="p-2">Detected</th><th className="p-2">Preview</th></tr></thead>
                    <tbody className="divide-y divide-yellow-200 dark:divide-yellow-700/50">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum}><td className="p-2 font-mono">{lineNum}</td><td className="p-2">{info.languages.join(', ')}</td><td className="p-2 font-mono truncate max-w-xs">{info.line}</td></tr>
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
        if (savedData) try { setIncomeData(JSON.parse(savedData)); } catch(e){}
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

    const currentMonthData = incomeData[currentMonthKey] ?? { total: 0, entries: [] };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4">Add Entry</h3>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Lines</label><input type="number" value={lines} onChange={e => setLines(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md" required /></div>
                    <div><label className="block text-sm font-medium mb-1">Rate (MMK)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md" required /></div>
                    <button type="submit" className="w-full py-2 bg-sky-600 text-white font-bold rounded-md hover:bg-sky-700 transition-colors">Add</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700 gap-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Entries</h3>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800 flex flex-col items-end sm:items-center">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">This Month's Total</span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{currentMonthData.total.toLocaleString()} MMK</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {currentMonthData.entries.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                            <div><p className="font-bold">{entry.lines.toLocaleString()} lines</p><p className="text-xs text-slate-500">{entry.date}</p></div>
                            <p className="font-bold text-green-600">{entry.amount.toLocaleString()} MMK</p>
                        </div>
                    ))}
                    {currentMonthData.entries.length === 0 && <p className="text-center text-slate-500 py-10">No entries this month.</p>}
                </div>
            </div>
        </div>
    );
};

// --- Exam Countdown Modal Component ---
const ExamCountdownModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const targetDate = useMemo(() => new Date('2026-03-11T00:00:00').getTime(), []);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const diff = targetDate - now;
            if (diff <= 0) { setTimeLeft(null); clearInterval(timer); } 
            else {
                setTimeLeft({
                    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, targetDate]);

    if (!isOpen || !timeLeft) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-teal-100 dark:border-teal-900/30 relative overflow-hidden text-center transition-all">
                
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 z-10"></div>
                
                <div className="relative z-10 mx-auto w-40 h-40 mb-6">
                    <img 
                        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXZtcXo2OTM0c3RvcHE4em53YWsya2ExaW5jbnV0enY3OHhid252YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0Rcmxg6VyLlIMo1Cwr/giphy.gif" 
                        alt="Cute Cheering Cat" 
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                </div>

                <h3 className="relative z-10 text-2xl font-bold text-slate-900 dark:text-white mb-1">You can do it Pin Pin's Mother</h3>
                <p className="relative z-10 text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium tracking-wide uppercase">Exam Countdown: March 11, 2026</p>

                <div className="relative z-10 grid grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Days', val: timeLeft.d },
                        { label: 'Hrs', val: timeLeft.h },
                        { label: 'Min', val: timeLeft.m },
                        { label: 'Sec', val: timeLeft.s }
                    ].map(t => (
                        <div key={t.label} className="bg-slate-50 dark:bg-slate-900/50 py-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                            <span className="block text-2xl font-bold text-teal-600 dark:text-teal-400 leading-none">{t.val}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1">{t.label}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="relative z-10 w-full py-3 px-6 text-white bg-teal-600 font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md active:scale-[0.98]"
                >
                    Okay
                </button>
            </div>
        </div>
    );
};

const HelpSection: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const VPN_KEY = "ss://YWVzLTI1Ni1nY206V0JBRFBJT2k5akAxMzkuMTgwLjIxNS4yMDE6MzYyMzA#Kev";

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); setStatus('sending');
        const formData = new FormData();
        formData.append("_subject", subject); formData.append("message", body);
        try {
            const resp = await fetch("https://formsubmit.co/kaungce@gmail.com", { method: "POST", body: formData });
            if (resp.ok) { setStatus('success'); setSubject(''); setBody(''); } else setStatus('error');
        } catch (e) { setStatus('error'); }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-6">Help Center</h2>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl mb-8 border border-indigo-200 dark:border-indigo-800">
                    <p className="font-bold text-sm mb-2">VPN Access Key</p>
                    <code className="block p-3 bg-white dark:bg-slate-950 rounded border text-[10px] break-all">{VPN_KEY}</code>
                    <button onClick={() => navigator.clipboard.writeText(VPN_KEY)} className="mt-2 text-xs text-sky-600 font-bold">Copy Key</button>
                </div>
                <form onSubmit={handleSend} className="space-y-4">
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" required />
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Message" rows={4} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" required />
                    <button type="submit" disabled={status === 'sending'} className="w-full py-3 bg-sky-600 text-white font-bold rounded-lg">{status === 'sending' ? 'Sending...' : 'Send Message'}</button>
                    {status === 'success' && <p className="text-green-600 text-sm text-center">Sent successfully!</p>}
                </form>
            </div>
        </div>
    );
};

// --- Main Application ---
export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker' | 'help';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [cleanedContent, setCleanedContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('cleaned.srt');
    const [summary, setSummary] = useState<ChangeSummary | null>(null);
    const [foreignReport, setForeignReport] = useState<ForeignLanguageReport | null>(null);

    const [showExamModal, setShowExamModal] = useState(false);

    useEffect(() => {
        const examEndDate = new Date('2026-03-17T23:59:59');
        if (new Date() < examEndDate) setShowExamModal(true);
    }, []);

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
        <div className="min-h-screen text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
            <ExamCountdownModal isOpen={showExamModal} onClose={() => { setShowExamModal(false); }} />
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Translator's Toolkit</h1>
                    <div className="mt-6 flex justify-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-lg mx-auto">
                        {['cleaner', 'tracker', 'help'].map((view) => (
                            <button key={view} onClick={() => setActiveView(view as AppView)} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all ${activeView === view ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-white/50"}`}>
                                {view === 'cleaner' ? '🎬 Cleaner' : view === 'tracker' ? '💰 Tracker' : '🎯 Help'}
                            </button>
                        ))}
                    </div>
                </header>
                <main>
                    {activeView === 'cleaner' ? (
                        appState === 'idle' ? <FileUpload onFileSelect={handleFileSelect} disabled={false} /> :
                        originalContent && cleanedContent && summary && foreignReport && (
                            <div className="space-y-8">
                                <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h2 className="text-xl font-bold">Review Changes</h2>
                                    <div className="flex gap-3">
                                        <button onClick={() => setAppState('idle')} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 rounded-md">Clean Another</button>
                                        <button onClick={handleDownload} className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 shadow-md">Download Cleaned</button>
                                    </div>
                                </div>
                                <Preview originalContent={originalContent} cleanedContent={cleanedContent} summary={summary} foreignReport={foreignReport} />
                            </div>
                        )
                    ) : activeView === 'tracker' ? <IncomeTracker /> : <HelpSection />}
                </main>
                <footer className="text-center mt-12 text-xs text-slate-500"><p>Translator's Toolkit v4.3</p></footer>
            </div>
        </div>
    );
}