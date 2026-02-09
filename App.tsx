import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

const MOTIVATIONAL_QUOTES = [
    "Good Luck, Thu Thu! You're the best.",
    "Fighting, Thu Thu! 💪",
    "Go show them how it's done, Thu Thu.",
    "Don't worry, it's going to be a breeze for you.",
    "Thu Thu, you can do it! No doubt about it.",
    "Sending you a giant hug and lots of luck.",
    "Thu Thu... you’re going to pass with flying colors.",
    "Recite your prayers, stay calm, and dominate, Thu Thu.",
    "I’m praying for you and thinking of you every second. You've got this!",
    "I believe in you more than I believe in anything else. You've got this, Thu Thu.",
    "Take a deep breath for me. You’re going to be brilliant today.",
    "I’m already proud of you, no matter what. But I know you’re going to kill it anyway!",
    "Think of me as your secret weapon today. I’m sending you all my strength, Thu Thu.",
    "I know how much this means to you, and that’s why I know you’re going to succeed.",
    "If you get stuck on a question, Relax and calm first. I know you can solve it.",
    "I’ll be waiting to hear how great you did. Go shine, Thu Thu.",
    "Thu Thu... your hard work will pay off, believe it.",
    "Don't stress too much Thu Thu, I know you can do your best.",
    "May lots of luck come to Thu Thu.",
    "This exam is easy for Thu Thu. Fighting!",
    "Don't lose sleep studying, Thu Thu. Take care of your health.",
    "Don't forget that I'm always on Thu Thu's side.",
    "Just try your best Thu Thu, good results will come naturally.",
    "May everything go smoothly for Thu Thu.",
    "Stay calm and answer Thu Thu... you can do this.",
    "Everything will happen just as Thu Thu imagined.",
    "Thu Thu is the smartest person I know, answer with confidence.",
    "Thu Thu, you’re the smartest person I know.",
    "Don't let the nerves win, Thu Thu. You know this material better than anyone.",
    "Fighting, Thu Thu! This exam is just a small hurdle for someone as talented as you.",
    "Difficulties are just challenges for people like you. You make the hard things look easy.",
    "Your brain is absolute gold, Thu Thu.",
    "Ignore the noise and the stress around you. Just do your thing, Thu Thu. You’re in a league of your own.",
    "Don't stress too much, Thu Thu. I know you can do your best, and I’m right here behind you.",
    "I’m sending all the luck in the world to Thu Thu today. You deserve every bit of it.",
    "Never forget that I’m always on your side, Thu Thu.",
    "I hope everything goes as smoothly as possible for you today.",
    "Stay calm and keep that beautiful focus, Thu Thu... you’ve got this handled.",
    "Everything will happen just as you’ve imagined. Your dreams are closer than you think.",
    "Thu Thu, your mind is honestly my favorite thing about you. You’re going to brilliant today.",
    "I love how your brain works. That exam paper has no idea what’s coming for it.",
    "You’re not just hardworking; you’re genuinely brilliant. Watching you solve things is impressive, Thu Thu.",
    "I’m always in awe of how quickly you pick things up. You’re definitely the smartest person in the room.",
    "You have this way of making the most complex topics seem simple. That’s how I know you’ve got this handled.",
    "I’m so lucky to be close to someone as bright and capable as you."
];

// --- Child Components ---

const DailyQuote: React.FC = () => {
    const quote = useMemo(() => {
        const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        return MOTIVATIONAL_QUOTES[index];
    }, []);

    return (
        <div className="mt-3 px-4 animate-fade-in">
            <p className="text-sm sm:text-base font-medium text-pink-500 dark:text-pink-400 italic">
                ✨ "{quote}" ✨
            </p>
        </div>
    );
};

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
                    <pre className="text-xs text-green-700 text-green-600 dark:text-green-300 overflow-x-auto p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
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
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [issue, setIssue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const hiddifyKeyVless = "vless://897b11cf-aa86-4fa0-9a6b-87d6c2a3cc5a@my.edumailme.com:443?alpn=h2%2Chttp%2F1.1&encryption=none&fp=chrome&host=my.edumailme.com&path=%2Fxray&security=tls&sni=my.edumailme.com&type=ws#SINGAPORE-50.00GB%F0%9F%93%8A-30D%E2%8F%B3";
    const hiddifyKeyVmess = "vmess://ewogICJhZGQiOiAibXkuZWR1bWFpbG1lLmNvbSIsCiAgImFsbG93SW5zZWN1cmUiOiBmYWxzZSwKICAiYWxwbiI6ICJoMixodHRwLzEuMSIsCiAgImZwIjogImNocm9tZSIsCiAgImhvc3QiOiAibXkuZWR1bWFpbG1lLmNvbSIsCiAgImlkIjogImRiYjNjNTUxLTFkNGQtNGRhMC1hNGFkLTQxYWU2NjY1ZjFlOCIsCiAgIm5ldCI6ICJ3cyIsCiAgInBhdGgiOiAiL3hyYXkiLAogICJwb3J0IjogMjA4MywKICAicHMiOiAiU0lOR0FQT1JFLTUwLjAwR0Lwn5OKLTMwROKPsyIsCiAgInNjeSI6ICJhdXRvIiwKICAic25pIjogIm15LmVkdW1haWxtZS5jb20iLAogICJ0bHMiOiAidGxzIiwKICAidHlwZSI6ICJub25lIiwKICAidiI6ICIyIgp9";
    const driveLink = "https://drive.google.com/drive/u/0/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju";

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
             <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </span>
                    My Google Drive
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    <a href={driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center p-5 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl hover:shadow-md transition-all group border border-pink-100 dark:border-pink-800/30">
                        <div className="bg-pink-500 text-white p-3 rounded-xl mr-5 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-slate-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">Open Toolkit Drive</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Essential apps, installers, and tutorial documentation (Updated 2026)</p>
                        </div>
                    </a>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report an Issue
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                    Encountering problems with the toolkit, VPN, or access? Describe the issue below so I can help.
                </p>
                <form onSubmit={handleReportSubmit} className="space-y-3 relative">
                     <div className="relative">
                             <input
                                type="text"
                                placeholder="What's the issue?"
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all disabled:opacity-50 text-sm pr-20"
                                required
                                disabled={isSubmitting}
                            />
                             <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`absolute right-1 top-1 bottom-1 px-4 text-white font-bold rounded-md transition-colors flex items-center justify-center text-xs ${isSubmitting ? 'bg-amber-400 cursor-wait' : 'bg-amber-600 hover:bg-amber-700'}`}
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Send'}
                            </button>
                    </div>
                    {submitStatus === 'success' && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-bold animate-pulse mt-2">
                            ✅ Issue reported successfully!
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-bold mt-2">
                            ❌ Failed to send report.
                        </div>
                    )}
                </form>
            </div>

             <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center relative z-10">
                    <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-lg mr-3">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </span>
                    Hiddify VPN Access
                </h2>

                <div className="mb-6 bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-500 p-4 rounded-r-lg relative z-10">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-violet-800 dark:text-violet-200">Download & Setup</h3>
                            <div className="mt-2 text-sm text-violet-700 dark:text-violet-300 leading-relaxed space-y-3">
                                <p>Choose one of the links below to download <span className="font-bold">Hiddify VPN</span>. Installation is easy: just double-click the installer and accept everything.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    <a href="https://limewire.com/d/6ZcJw#cMZPd7rz3B" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 transition-colors text-xs font-bold text-violet-700 dark:text-violet-300">
                                        🚀 LimeWire Mirror
                                    </a>
                                    <a href="https://t.me/+BfyZ73a7lbcyM2Rl" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 transition-colors text-xs font-bold text-violet-700 dark:text-violet-300">
                                        ✈️ Telegram Channel
                                    </a>
                                    <a href="https://hiddify.com/" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 transition-colors text-xs font-bold text-violet-700 dark:text-violet-300 col-span-full">
                                        🌐 hiddify.com (Choose Windows)
                                    </a>
                                </div>
                                <p className="text-[11px] opacity-80 mt-2 italic">This VPN is recommended for high-speed access during peak hours. Note: Ensure you remove previous outdated keys before importing the new one below.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Hiddify Key 1 (VLESS)</h3>
                                <span className="text-xs font-mono bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 px-2 py-1 rounded">Latest Update</span>
                            </div>
                             <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-800/30 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                                </svg>
                                <span>Refreshed: 2026-01-28</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-slate-500 break-all h-24 overflow-y-auto select-all leading-relaxed">
                                {hiddifyKeyVless}
                            </code>
                            <button 
                                onClick={() => handleCopy(hiddifyKeyVless, 'vless')}
                                className={`flex flex-col items-center justify-center px-4 rounded-lg font-bold text-sm transition-all duration-200 border min-w-[100px] ${copiedId === 'vless' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                                {copiedId === 'vless' ? (
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

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Hiddify Key 2 (VMESS)</h3>
                                <span className="text-xs font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded">Alt Server</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-slate-500 break-all h-24 overflow-y-auto select-all leading-relaxed">
                                {hiddifyKeyVmess}
                            </code>
                            <button 
                                onClick={() => handleCopy(hiddifyKeyVmess, 'vmess')}
                                className={`flex flex-col items-center justify-center px-4 rounded-lg font-bold text-sm transition-all duration-200 border min-w-[100px] ${copiedId === 'vmess' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                                {copiedId === 'vmess' ? (
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
                    <DailyQuote />
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
                <footer className="text-center mt-12 text-xs text-slate-500"><p>Translator's Toolkit update 28.01.2026</p></footer>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}