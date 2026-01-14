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

// --- Main Application ---
export default function App() {
    type AppState = 'idle' | 'preview';
    type AppView = 'cleaner' | 'tracker';
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeView, setActiveView] = useState<AppView>('cleaner');
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [cleanedContent, setCleanedContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('cleaned.srt');
    const [summary, setSummary] = useState<ChangeSummary | null>(null);
    const [foreignReport, setForeignReport] = useState<ForeignLanguageReport | null>(null);

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
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Translator's Toolkit</h1>
                    <div className="mt-6 flex justify-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm mx-auto shadow-inner">
                        {(['cleaner', 'tracker'] as AppView[]).map((view) => (
                            <button 
                                key={view} 
                                onClick={() => setActiveView(view)} 
                                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center ${activeView === view ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-white/50"}`}
                            >
                                {view === 'cleaner' && '🎬 Cleaner'}
                                {view === 'tracker' && '💰 Tracker'}
                            </button>
                        ))}
                    </div>
                </header>
                <main>
                    {activeView === 'cleaner' && (
                        appState === 'idle' ? <FileUpload onFileSelect={handleFileSelect} disabled={false} /> :
                        originalContent && cleanedContent && summary && foreignReport && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h2 className="text-xl font-bold">Review Changes</h2>
                                    <div className="flex gap-3">
                                        <button onClick={() => setAppState('idle')} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 rounded-md">Clean Another</button>
                                        <button onClick={handleDownload} className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 shadow-md flex items-center"><DownloadIcon /> Download</button>
                                    </div>
                                </div>
                                <Preview originalContent={originalContent} cleanedContent={cleanedContent} summary={summary} foreignReport={foreignReport} />
                            </div>
                        )
                    )}
                    {activeView === 'tracker' && <IncomeTracker />}
                </main>
                <footer className="text-center mt-12 text-xs text-slate-500"><p>Translator's Toolkit v4.6</p></footer>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}