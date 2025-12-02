
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

const HelpIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const SendIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const AttachmentIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

// --- Success Modal Component ---
const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 dark:border-slate-700 transform transition-all scale-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                        don't worry cc has received the message and will reply u later
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                    >
                        Awesome
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- New Help Section Component (Replacing Message Box) ---
const HelpSection: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [translatedFile, setTranslatedFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [showModal, setShowModal] = useState(false);

    // Refs to clear file inputs
    const originalInputRef = useRef<HTMLInputElement>(null);
    const translatedInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`);
                e.target.value = ""; // Clear input
                setFile(null);
            } else {
                setFile(file);
            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const formData = new FormData();
            formData.append("_subject", subject || "Help Request / Message");
            formData.append("message", body);
            formData.append("_template", "table");
            formData.append("_captcha", "false");

            // Append files if they exist
            if (originalFile) {
                formData.append("Original Subtitle (English)", originalFile);
            }
            if (translatedFile) {
                formData.append("Translated Subtitle (Myanmar)", translatedFile);
            }

            // Using FormSubmit.co AJAX endpoint to send email directly
            const response = await fetch("https://formsubmit.co/ajax/kaungce@gmail.com", {
                method: "POST",
                headers: { 
                    "Accept": "application/json"
                    // Content-Type must NOT be set when sending FormData, the browser sets it with boundary
                },
                body: formData
            });

            if (response.ok) {
                setStatus('success');
                setSubject('');
                setBody('');
                setOriginalFile(null);
                setTranslatedFile(null);
                if (originalInputRef.current) originalInputRef.current.value = "";
                if (translatedInputRef.current) translatedInputRef.current.value = "";
                
                // Show success modal
                setShowModal(true);
                
                // Reset status after 5 seconds
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
             <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} />
             <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-full mr-4">
                        <HelpIcon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Help Center</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Get assistance or send files directly</p>
                    </div>
                </div>
                
                <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 p-4 mb-8 rounded-r-md flex items-start">
                    <svg className="w-6 h-6 text-sky-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sky-800 dark:text-sky-200 font-medium">
                            Ask whatever you want to CC
                        </p>
                        <p className="text-sm text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wide mt-1">
                            (Work Related Only)
                        </p>
                    </div>
                </div>

                {status === 'success' && !showModal && (
                    <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center animate-fade-in">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Message and files sent successfully!
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center animate-fade-in">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Failed to send. Please try again later.
                    </div>
                )}

                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                        <input 
                            type="text" 
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={status === 'sending' || status === 'success'}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all disabled:opacity-50"
                            placeholder="What is this regarding?"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                        <textarea 
                            id="message"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            required
                            disabled={status === 'sending' || status === 'success'}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none disabled:opacity-50"
                            placeholder="Type your message or question here..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                <AttachmentIcon /> Original Subtitle (English)
                            </label>
                            <input 
                                type="file" 
                                ref={originalInputRef}
                                onChange={(e) => handleFileChange(e, setOriginalFile)}
                                accept=".srt,.txt"
                                className="block w-full text-sm text-slate-500 dark:text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-sky-50 file:text-sky-700
                                  dark:file:bg-sky-900/30 dark:file:text-sky-300
                                  hover:file:bg-sky-100 dark:hover:file:bg-sky-800/50
                                  transition-all"
                            />
                             <p className="text-xs text-slate-400 mt-1">Optional. .srt or .txt files (Max 5MB)</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                <AttachmentIcon /> Translated Subtitle (Myanmar)
                            </label>
                            <input 
                                type="file" 
                                ref={translatedInputRef}
                                onChange={(e) => handleFileChange(e, setTranslatedFile)}
                                accept=".srt,.txt"
                                className="block w-full text-sm text-slate-500 dark:text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-green-50 file:text-green-700
                                  dark:file:bg-green-900/30 dark:file:text-green-300
                                  hover:file:bg-green-100 dark:hover:file:bg-green-800/50
                                  transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-1">Optional. .srt or .txt files (Max 5MB)</p>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === 'sending' || status === 'success'}
                        className={`w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-sky-500/50 
                            ${status === 'sending' ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}
                            ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                        `}
                    >
                        {status === 'sending' ? (
                            <>
                                <LoadingSpinner />
                                Sending...
                            </>
                        ) : (
                            <>
                                <SendIcon />
                                Send Message & Files
                            </>
                        )}
                    </button>
                    {status !== 'success' && status !== 'error' && (
                         <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                            Powered by FormSubmit
                        </p>
                    )}
                   
                </form>
             </div>
        </div>
    );
};


// --- Main Application Component ---

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
                    
                    <div className="mt-6 flex justify-center gap-2 sm:gap-4 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-lg mx-auto">
                        <button onClick={() => setActiveView('cleaner')} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeView === 'cleaner' ? activeTabClasses : inactiveTabClasses}`}>
                            🎬 SRT Cleaner
                        </button>
                         <button onClick={() => setActiveView('tracker')} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeView === 'tracker' ? activeTabClasses : inactiveTabClasses}`}>
                            💰 Income Tracker
                        </button>
                        <button onClick={() => setActiveView('help')} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeView === 'help' ? activeTabClasses : inactiveTabClasses}`}>
                            <div className="flex items-center justify-center gap-2">
                                <HelpIcon className="w-4 h-4" />
                                Help Center
                            </div>
                        </button>
                    </div>

                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        {activeView === 'cleaner' 
                            ? "An intelligent tool to clean, format, and prepare your SRT files for translation, with built-in foreign language detection."
                            : activeView === 'tracker'
                            ? "Track your translation income based on lines and rate, with a complete monthly history."
                            : "Contact the developer for work-related inquiries or send subtitle files for assistance."
                        }
                    </p>
                </header>

                <main>
                    {activeView === 'cleaner' ? cleanerView : activeView === 'tracker' ? <IncomeTracker /> : <HelpSection />}
                </main>
                 <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
                    <p>Translator's Toolkit v3.1</p>
                </footer>
            </div>
        </div>
    );
}
