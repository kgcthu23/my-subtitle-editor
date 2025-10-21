
import React, { useState, useCallback, useMemo } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport } from './types';

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
    const reportEntries = Object.entries(report);
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


// --- Main Application Component ---

export default function App() {
    type AppState = 'idle' | 'preview';
    const [appState, setAppState] = useState<AppState>('idle');
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

        const reportData = detectForeignLanguages(content);
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

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">🎬 SRT Subtitle Cleaner</h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        An intelligent tool to clean, format, and prepare your SRT files for translation, with built-in foreign language detection.
                    </p>
                </header>

                <main>
                    {appState === 'idle' && (
                        <FileUpload onFileSelect={handleFileSelect} disabled={false} />
                    )}

                    {appState === 'preview' && originalContent && cleanedContent && summary && foreignReport && (
                        <div className="space-y-8">
                           <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-4 z-10">
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
                </main>
                 <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
                    <p>SRT File Cleaner v2.1 | English to Myanmar Translation Assistant</p>
                </footer>
            </div>
        </div>
    );
}
