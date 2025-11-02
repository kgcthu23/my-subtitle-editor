
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';

// SVG Icons for UI enhancement
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

const CalendarIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


// --- Child Components defined outside the main component to prevent re-renders ---

interface FileUploadProps {
    onFileSelect: (content: string, fileName: string) => void;
    disabled: boolean;
}
const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onFileSelect(content, file.name);
            };
            reader.readAsText(file, 'UTF-8');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
             <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-sky-400/50 dark:border-sky-500/60 flex flex-col items-center justify-center p-12 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors duration-300">
                <UploadIcon />
                <span className="mt-2 text-base font-medium text-slate-600 dark:text-slate-300">
                    Click to upload or drag and drop
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">SRT files only</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".srt" onChange={handleFileChange} disabled={disabled}/>
            </label>
        </div>
    );
};

interface PreviewProps {
    originalContent: string;
    cleanedContent: string;
    summary: ChangeSummary;
    foreignReport: ForeignLanguageReport;
}
const Preview: React.FC<PreviewProps> = ({ originalContent, cleanedContent, summary, foreignReport }) => {
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
        { label: 'Backslashes Removed', value: summary.backslashesRemoved },
        { label: 'Timestamps Fixed', value: summary.timestampsFixed },
        { label: 'HTML Tags Fixed', value: summary.htmlTagsFixed },
        { label: 'Square Brackets Removed', value: summary.bracketsRemoved },
        { label: 'Parentheses Removed', value: summary.parensRemoved },
        { label: 'Empty Hyphen Lines Removed', value: summary.hyphensRemoved },
        { label: 'Myanmar Characters Removed', value: summary.myanmarCharsRemoved },
        { label: 'Multi-dialogue Lines Split', value: summary.dialoguesSplit },
    ].filter(item => item.value > 0);

    if (items.length === 0 && summary.foreignLinesCount === 0) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Summary of Changes</h3>
                 <p className="text-slate-600 dark:text-slate-300">No changes detected in the file.</p>
             </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Summary of Changes</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <li key={item.label} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                        <span className="block text-xl font-bold text-sky-600 dark:text-sky-400">{item.value}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    // FIX: Use Object.keys(...).map(...) to ensure correct type inference for report entries.
    // `Object.entries(report)` was incorrectly inferring the value type as 'unknown'.
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    if (reportEntries.length === 0) {
        return (
            <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-r-lg" role="alert">
                <p className="font-bold">No foreign languages detected.</p>
                <p>Ready for English to Myanmar translation!</p>
            </div>
        );
    }

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
             <div className="flex items-center">
                <WarningIcon />
                <div>
                    <p className="font-bold">Foreign Language Detection</p>
                    <p>The following lines may need manual translation.</p>
                </div>
            </div>
            <div className="mt-4 max-h-60 overflow-y-auto pr-2">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-yellow-100 dark:bg-yellow-800/50">
                        <tr>
                            <th className="p-2">Line</th>
                            <th className="p-2">Detected Languages</th>
                            <th className="p-2">Content Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-200 dark:divide-yellow-700/50">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum}>
                                <td className="p-2 font-mono">{lineNum}</td>
                                <td className="p-2">
                                    {info.languages.map(lang => (
                                        <span key={lang} className="inline-block bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{lang}</span>
                                    ))}
                                </td>
                                <td className="p-2 font-mono truncate max-w-xs">{info.line}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- New Income Tracker Component ---
const IncomeTracker: React.FC = () => {
    const [lines, setLines] = useState('');
    const [rate, setRate] = useState('');
    const [incomeData, setIncomeData] = useState<IncomeData>({});

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('incomeTrackerData');
            if (savedData) {
                setIncomeData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to parse income data from localStorage", error);
        }
    }, []);

    const { currentMonthKey, todayKey } = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return {
            currentMonthKey: `${year}-${month}`,
            todayKey: `${year}-${month}-${day}`
        };
    }, []);

    const saveData = (newData: IncomeData) => {
        try {
            localStorage.setItem('incomeTrackerData', JSON.stringify(newData));
            setIncomeData(newData);
        } catch (error) {
            console.error("Failed to save income data to localStorage", error);
        }
    };

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const numLines = parseInt(lines, 10);
        const numRate = parseFloat(rate);

        if (isNaN(numLines) || isNaN(numRate) || numLines <= 0 || numRate <= 0) {
            alert("Please enter valid positive numbers for lines and rate.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        const dateKey = `${year}-${month}-${day}`;
        const monthKey = `${year}-${month}`;

        const newEntry: IncomeEntry = {
            id: crypto.randomUUID(),
            date: dateKey,
            timestamp: now.toISOString(),
            lines: numLines,
            rate: numRate,
            amount: numLines * numRate,
        };

        const updatedData = JSON.parse(JSON.stringify(incomeData));
        if (!updatedData[monthKey]) {
            updatedData[monthKey] = { total: 0, entries: [] };
        }

        updatedData[monthKey].entries.unshift(newEntry);
        updatedData[monthKey].total += newEntry.amount;

        saveData(updatedData);
        setLines('');
        setRate('');
    };

    const handleDeleteEntry = (entryId: string) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) {
            return;
        }
    
        const updatedData = JSON.parse(JSON.stringify(incomeData));
        const monthData = updatedData[currentMonthKey];
    
        if (!monthData) {
            console.error("Could not find month data for deletion.");
            return;
        }
    
        const entryToDelete = monthData.entries.find((e: IncomeEntry) => e.id === entryId);
        if (!entryToDelete) {
            console.error("Could not find entry to delete.");
            return;
        }
    
        monthData.total -= entryToDelete.amount;
        monthData.entries = monthData.entries.filter((e: IncomeEntry) => e.id !== entryId);
    
        saveData(updatedData);
    };

    const currentMonthData = incomeData[currentMonthKey] ?? { total: 0, entries: [] };
    const todaysEntries = currentMonthData.entries.filter(e => e.date === todayKey);
    const historyMonths = Object.keys(incomeData)
        .filter(key => key !== currentMonthKey)
        .sort()
        .reverse();

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);
    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Add New Entry</h3>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div>
                                <label htmlFor="lines" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Lines</label>
                                <input type="number" name="lines" id="lines" value={lines} onChange={e => setLines(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., 500" required />
                            </div>
                            <div>
                                <label htmlFor="rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rate per Line (MMK)</label>
                                <input type="number" name="rate" id="rate" value={rate} onChange={e => setRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., 50" step="any" required />
                            </div>
                            <button type="submit" className="w-full inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors shadow-md">
                                <PlusIcon /> Add Entry
                            </button>
                        </form>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                        <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">This Month's Income</h3>
                        <p className="text-4xl font-extrabold text-green-600 dark:text-green-400 mt-2">{formatCurrency(currentMonthData.total)} <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500">MMK</span></p>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Today's Entries</h3>
                        {todaysEntries.length > 0 ? (
                            <ul className="space-y-3">
                                {todaysEntries.map(entry => (
                                    <li key={entry.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md group transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80">
                                        <div>
                                            <p className="font-semibold text-slate-700 dark:text-slate-200">{entry.lines.toLocaleString()} lines</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">@ {formatCurrency(entry.rate)} MMK/line</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(entry.amount)}</p>
                                            <button 
                                                onClick={() => handleDeleteEntry(entry.id)} 
                                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-opacity p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                                aria-label="Delete entry"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No entries added for today.</p>
                        )}
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><CalendarIcon /> Monthly History</h3>
                        {historyMonths.length > 0 ? (
                             <ul className="space-y-2">
                                {historyMonths.map(monthKey => (
                                    <li key={monthKey} className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 py-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatMonth(monthKey)}</p>
                                        <p className="font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(incomeData[monthKey].total)} MMK</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-slate-500 dark:text-slate-400 text-center py-4">No past records to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Application Component ---

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
        
        const cleaned = cleanSrtContent(content);
        setCleanedContent(cleaned);

        const summaryData = getChangeSummary(content);
        setSummary(summaryData);

        const reportData = detectForeignLanguages(cleaned);
        setForeignReport(reportData);

        const baseName = name.replace(/\.srt$/i, '');
        setFileName(`${baseName}_cleaned.srt`);
        
        setAppState('preview');
    }, []);

    const handleDownload = useCallback(() => {
        if (!cleanedContent) return;
        const blob = new Blob([cleanedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [cleanedContent, fileName]);

    const reset = () => {
        setAppState('idle');
        setOriginalContent(null);
        setCleanedContent(null);
        setFileName('');
        setSummary(null);
        setForeignReport(null);
    };

    const cleanerView = (
        <>
            {appState === 'idle' && (
                <FileUpload onFileSelect={handleFileSelect} disabled={false} />
            )}

            {appState === 'preview' && originalContent && cleanedContent && summary && foreignReport && (
                <div className="space-y-8">
                    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-4 z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Preview of Changes</h2>
                        <div className="flex items-center gap-3">
                            <button onClick={reset} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                Clean Another File
                            </button>
                            <button onClick={handleDownload} className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors shadow-md">
                                <DownloadIcon />
                                Download Cleaned File
                            </button>
                        </div>
                        </div>
                    </div>

                    <Preview 
                        originalContent={originalContent} 
                        cleanedContent={cleanedContent}
                        summary={summary}
                        foreignReport={foreignReport}
                    />
                </div>
            )}
        </>
    );
    
    const activeTabClasses = "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm";
    const inactiveTabClasses = "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50";

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Translator's Toolkit</h1>
                    
                    <div className="mt-6 flex justify-center gap-2 sm:gap-4 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm mx-auto">
                        <button onClick={() => setActiveView('cleaner')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeView === 'cleaner' ? activeTabClasses : inactiveTabClasses}`}>
                            🎬 SRT Cleaner
                        </button>
                         <button onClick={() => setActiveView('tracker')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeView === 'tracker' ? activeTabClasses : inactiveTabClasses}`}>
                            💰 Income Tracker
                        </button>
                    </div>

                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        {activeView === 'cleaner' 
                            ? "An intelligent tool to clean, format, and prepare your SRT files for translation, with built-in foreign language detection."
                            : "Track your translation income based on lines and rate, with a complete monthly history."
                        }
                    </p>
                </header>

                <main>
                    {activeView === 'cleaner' ? cleanerView : <IncomeTracker />}
                </main>
                 <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
                    <p>Translator's Toolkit v3.0</p>
                </footer>
            </div>
        </div>
    );
}
