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

const Guide: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const outlineKey = "ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpYQXJBZ0RWTEY4MkhWMzBaMDdReDNs@194.56.225.72:36763/?outline=1#Feb 19 𝙆𝙚𝙮";

    const handleCopy = () => {
        navigator.clipboard.writeText(outlineKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             {/* Useful Resources - Now at the Top */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </span>
                    Useful Resources
                </h2>

                <div className="grid gap-6">
                    <a href="https://drive.google.com/drive/u/1/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors group">
                        <div className="bg-pink-500 text-white p-2 rounded-full mr-4">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">Click to access</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">View on Google Drive</p>
                        </div>
                    </a>
                </div>
            </div>

             {/* Intro Text */}
             <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium italic">
                    "This guide includes vpn recommendation, error fixing and apps recommendation"
                </p>
             </div>

             {/* VPN Section */}
             <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center relative z-10">
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg mr-3">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.464 9.536 11.464 7.464 9.464M6.343 11.657A8 8 0 1018.657 5.657L6.343 11.657z" /></svg>
                    </span>
                    VPN Access
                </h2>

                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg relative z-10">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Important Update</h3>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                <p>Hey, as u have noticed on the internet. The military gov start banning outline vpn and my key which is premium version might or might not work. Even if it connected, it would only connect with slow speed. It may depend on the wifi too. My suggestion is connect it first. then go to <a href="https://www.fast.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-900">www.fast.com</a> if it shows you more than 10mbps. you might be good but if it's not then best bet is x-vpn.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    {/* Outline Key Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Outline VPN Key</h3>
                                <span className="text-xs font-mono bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 px-2 py-1 rounded">Feb 19 Update</span>
                            </div>
                             <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-800/30 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>Note: Remove non-working keys first. Valid for 1 month only.</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-slate-500 break-all h-24 overflow-y-auto select-all">
                                {outlineKey}
                            </code>
                            <button 
                                onClick={handleCopy}
                                className={`flex flex-col items-center justify-center px-4 rounded-lg font-bold text-sm transition-all duration-200 border ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* X-VPN Section */}
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <p>
                            <span className="font-bold text-orange-700 dark:text-orange-400">Alternative:</span> If you don't get access to Outline VPN, you can try X-VPN which you likely already have installed. If not, <a href="https://drive.google.com/drive/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 font-bold hover:underline decoration-2 underline-offset-2">click here to download</a>.
                        </p>
                    </div>
                </div>
             </div>

             <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Pro Tip: The best way to check errors is "Compare"
                </h3>
                <p className="opacity-90 text-sm">Use the Compare feature in Subtitle Edit to visualize differences and fix issues efficiently.</p>
            </div>

             <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Common Errors & Solutions
                </h2>

                <div className="space-y-12">
                    {/* Error Item 1 */}
                    <div className="border-l-4 border-sky-500 pl-6 py-2">
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">
                            "Empty line expected, but found number..."
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 shadow-inner overflow-hidden border border-slate-700">
                                <div className="flex items-center gap-2 mb-2 text-yellow-500 border-b border-slate-700 pb-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="font-semibold">Subtitle Edit 4.0.14 Error Log</span>
                                </div>
                                <div className="space-y-1 opacity-90">
                                    <p><span className="text-slate-500">Line 3:</span> Empty line expected, but found number (2) followed by time code.</p>
                                    <p><span className="text-slate-500">Line 5:</span> Empty line expected, but found number (3) followed by time code.</p>
                                    <p><span className="text-slate-500">Line 7:</span> Empty line expected, but found number (4) followed by time code.</p>
                                    <p className="text-slate-500 pl-2">...</p>
                                    <p><span className="text-slate-500">Line 1090:</span> Empty line expected, but found number (272) followed by time code.</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <h4 className="font-semibold text-sky-600 dark:text-sky-400 mb-2 uppercase tracking-wide text-xs">Best Solution</h4>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800">
                                    <p className="mb-2">This is a normal error often caused by merged lines in the source file.</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        👉 just check via <span className="text-sky-600 dark:text-sky-400">"Import Timestamp"</span> in Subtitle Edit
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Item 2 */}
                    <div className="border-l-4 border-sky-500 pl-6 py-2">
                         <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                            "Subtitle with time codes has a different number of lines..."
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Visual Mockup of Dialog */}
                            <div className="bg-[#2b2b2b] rounded-lg p-1 shadow-xl border border-gray-600 font-sans text-sm select-none">
                                <div className="flex justify-between items-center px-2 py-1 bg-[#2b2b2b] text-white text-xs border-b border-gray-600">
                                    <span>Subtitle Edit 4.0.14</span>
                                    <span className="text-gray-400">✕</span>
                                </div>
                                <div className="p-6 flex gap-4 items-start">
                                    <div className="text-white text-4xl leading-none font-serif opacity-90 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center shrink-0">?</div>
                                    <div className="text-white text-sm mt-1">
                                        Subtitle with time codes has a different number of lines (1073) than current subtitle (1072) - continue anyway?
                                    </div>
                                </div>
                                <div className="bg-[#2b2b2b] p-3 flex justify-center gap-2">
                                    <div className="px-6 py-1 bg-[#3c3c3c] text-white border border-gray-500 shadow-sm text-xs min-w-[70px] text-center">Yes</div>
                                    <div className="px-6 py-1 bg-[#3c3c3c] text-white border border-gray-500 shadow-sm text-xs min-w-[70px] text-center">No</div>
                                    <div className="px-6 py-1 bg-[#3c3c3c] text-white border border-gray-500 shadow-sm text-xs min-w-[70px] text-center">Cancel</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <h4 className="font-semibold text-sky-600 dark:text-sky-400 mb-2 uppercase tracking-wide text-xs">Best Solution</h4>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800 space-y-3">
                                    <p className="text-sm">This usually happens during <span className="font-semibold">"Import Timestamp"</span>.</p>
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-100">👉 Use the <span className="text-sky-600 dark:text-sky-400 font-bold">"Compare"</span> feature.</p>
                                    </div>
                                    <ul className="text-sm space-y-1 mt-2 bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> <span>Green is okay</span></li>
                                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> <span>Yellow is timing error (ignore)</span></li>
                                        <li className="flex items-center gap-2 font-bold text-red-500 dark:text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> <span>Red is missing line (Fix this!)</span></li>
                                    </ul>
                                </div>
                            </div>
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
                        {(['cleaner', 'tracker', 'guide'] as AppView[]).map((view) => (
                            <button 
                                key={view} 
                                onClick={() => setActiveView(view)} 
                                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center ${activeView === view ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-white/50"}`}
                            >
                                {view === 'cleaner' && '🎬 Cleaner'}
                                {view === 'tracker' && '💰 Tracker'}
                                {view === 'guide' && '📘 Guide'}
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
                    {activeView === 'guide' && <Guide />}
                </main>
                <footer className="text-center mt-12 text-xs text-slate-500"><p>Translator's Toolkit update 23.01.2026</p></footer>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}