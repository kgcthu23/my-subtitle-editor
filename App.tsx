import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from './services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, IncomeData, IncomeEntry, DetectedLanguageInfo } from './types';
import {
    UploadCloud, Download, AlertTriangle, Eye, EyeOff,
    LayoutDashboard, Calculator, BookOpen, Sparkles,
    ArrowRight, CheckCircle2, Trash2, Link as LinkIcon, Info, MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const MOTIVATIONAL_QUOTES = [
    "Good Luck, Thu Thu! You're the best.",
    "Sending you a giant hug and lots of luck. ᕦ(ò_óˇ)ᕤ",
    "Thu Thu... you’re going to pass with flying colors.",
    "I’m praying for you and thinking of you every second. You've got this!",
    "I believe in you more than I believe in anything else. You've got this, Thu Thu.",
    "Take a deep breath for me. You’re going to be brilliant today.",
    "I’m already proud of you, no matter what. But I know you’re going to make it anyway!",
    "I know how much this means to you, and that’s why I know you’re going to succeed.",
    "If you get stuck on a question, Relax and calm first. I know you can solve it.",
    "I’ll be waiting to hear how great you did. Go shine, Thu Thu.",
    "Thu Thu... your hard work will pay off, believe it.",
    "Don't stress too much Thu Thu, I know you can do your best.",
    "May lots of luck come to Thu Thu.",
    "Don't lose sleep studying, Thu Thu. Take care of your health.",
    "Don't forget that I'm always on your side.",
    "Just try your best Thu Thu, good results will come naturally.",
    "May everything go smoothly for Thu Thu.",
    "Stay calm and answer Thu Thu... you can do this.",
    "Thu Thu, you’re the smartest person I know.",
    "Difficulties are just challenges for people like you. You make the hard things look easy.",
    "Your brain is absolute gold, Thu Thu.",
    "Ignore the noise and the stress around you. Just do your thing, Thu Thu. You’re in a league of your own.",
    "Don't stress too much, Thu Thu. I know you can do your best, and I’m right here behind you.",
    "Never forget that I’m always on your side, Thu Thu.",
    "I hope everything goes as smoothly as possible for you.",
    "Everything will happen just as you’ve imagined. Your dreams are closer than you think.",
    "Thu Thu, your mind is honestly my favorite thing about you. You’re going to brilliant today.",
    "I love how your brain works. U definitely knows about lots of things including weird facts. :P",
    "You’re not just hardworking; you’re genuinely brilliant. Watching you solve things is impressive, Thu Thu.",
    "I’m always in awe of how quickly you pick things up. You’re definitely the smartest person i know.",
    "You have this way of making the most complex topics seem simple. That’s how I know you’ve got this handled.",
    "I’m so lucky to be close to someone as bright and capable as you.",
    "သုသုရေ... Fighting နော်! အကောင်းဆုံး လုပ်နိုင်မှာပါ။",
    "ကံကောင်းခြင်းတွေအားလုံး သုသုဆီကို ရောက်လာပါစေ။",
    "သုသုက စီစီ့အတွက် အတော်ဆုံး လူသားလေးပါပဲ။",
    "သုသု စာဖြေနေတဲ့အချိန်တိုင်း ဆုတောင်းပေးနေမယ်နော်။",
    "သုသုကို ယုံကြည်တယ်။ သုသုလည်း ကိုယ့်ကိုကိုယ် ယုံကြည်ပါ။",
    "စာကျက်ရတာ ပင်ပန်းနေပြီလား သုသု။ ကျန်းမာရေးလည်းဂရုစိုက်‌နော်။",
    "သုသုက ထူးချွန်ပြီးသားပဲဟာ... ကိုယ့်ကိုယ်ကိုယုံပါ။",
    "သုသုက ဉာဏ်ကောင်းပြီးသား၊ ဘာမှ ပူစရာမလိုဘူး။",
    "မေးခွန်းခက်ရင် စိတ်မလှုပ်ရှားနဲ့၊ ဖြည်းဖြည်းချင်း စဉ်းစားနော် သုသု။",
    "ကျန်းမာရေးလည်း ဂရုစိုက်ဦးနော် သုသု။ အိပ်ရေးဝမှ ဉာဏ်ပွင့်မှာ။",
    "အရာအားလုံးက သုသု စိတ်ကူးထားတဲ့အတိုင်း ဖြစ်လာမှာပါ။",
    "အချိန်ရရင် ဘုရားရှိခိုးနော် သုသု။ စိတ်တည်ငြိမ်သွားလိမ့်မယ်။",
    "ရလဒ်ကို မတွေးနဲ့ဦး၊ လက်ရှိအချိန်မှာ အကောင်းဆုံးဖြေဖို့ပဲ အာရုံစိုက်နော် သုသု။",
    "သုသု ဘာပဲလုပ်လုပ် သုသုဘက်က အမြဲရှိနေမှာ။",
    "သုသုရေ... အားမလျှော့နဲ့နော်!",
    "ဂုဏ်ထူးတွေ အများကြီး ပိုင်ဆိုင်နိုင်ပါစေ သုသု။",
    "သုသုက No.1 ပဲ။",
    "သုသု အတွက် စီစီ့ရဲ့ အားအင်တွေ ပို့ပေးလိုက်ပါတယ်။ (づ ◕‿◕ )づ",
    "သုသု ဖြေသမျှ အမှန်တွေချည်း ဖြစ်ပါစေ။",
    "ယုံကြည်မှုသာ ထား၊ သုသု နိုင်ကို နိုင်ရမယ်။",
    "ချစ်ရတဲ့ သုသု... Fighting ပါနော်။",
    "သုသု ပြုံးလိုက်ရင် မျက်လုံးလေးတွေပါ လိုက်ပြုံးတာကို စီစီ သိပ်သဘောကျတယ်။ စိတ်ဖိစီးရင် အဲ့အပြုံးလေးကို သတိရနော်။",
    "သုသု ရယ်လိုက်ရင် မျက်လုံးလေးတွေ ပိတ်သွားတဲ့အထိ ချစ်ဖို့ကောင်းတာ... စာမေးပွဲပြီးရင် အဲ့လို ပျော်ပျော်ကြီး ပြုံးနိုင်ပါစေ။",
    "စီစီက သုသုဘက်ကနေ အမြဲရှိနေပါတယ်။",
    "ကျန်းမာရေး ဂရုစိုက်ပြီး ဖြေနော်... သုသု နေမကောင်းရင် စီစီ စိတ်မကောင်းဘူး。"
];

// --- Child Components ---

const DailyQuote: React.FC = () => {
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex(prev => {
                let next;
                do {
                    next = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
                } while (next === prev);
                return next;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const quote = MOTIVATIONAL_QUOTES[quoteIndex];

    return (
        <div key={quoteIndex} className="mt-4 px-6 py-4 bg-gradient-to-r from-pink-500/10 via-brand-500/10 to-violet-500/10 rounded-2xl border border-white/20 dark:border-white/5 backdrop-blur-sm animate-fade-in inline-block shadow-sm">
            <p className="text-sm sm:text-base font-medium text-brand-600 dark:text-brand-400 italic flex items-center gap-2">
                <Sparkles className="w-5 h-5 min-w-[1.25rem] text-pink-500" />
                <span>{quote}</span>
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
            <label htmlFor="file-upload" className="group relative cursor-pointer bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md rounded-3xl border-2 border-dashed border-brand-300 dark:border-brand-500/30 flex flex-col items-center justify-center p-16 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all duration-500 hover:border-brand-500 dark:hover:border-brand-400 shadow-[0_0_40px_-15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-brand-100 dark:bg-brand-900/50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                    <UploadCloud className="w-10 h-10 text-brand-600 dark:text-brand-400" />
                </div>
                <span className="mt-2 text-xl font-bold text-gray-800 dark:text-gray-200">Upload SRT File</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Drag and drop or click to browse</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Info className="w-32 h-32" /></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Original Content</h3>
                    </div>
                    <pre className="text-sm font-mono text-gray-600 dark:text-gray-300 overflow-x-auto p-4 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800 h-64 overflow-y-auto custom-scrollbar">
                        {originalLines.map((line, i) => <div key={i} className="py-0.5">{line || <span className="text-gray-400 italic">¶</span>}</div>)}
                    </pre>
                </div>
                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-brand-500/10 dark:shadow-none border border-white/20 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-brand-400 to-purple-500 h-full"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle2 className="w-32 h-32 text-brand-500" /></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Cleaned Content</h3>
                    </div>
                    <pre className="text-sm font-mono text-emerald-700 dark:text-emerald-400 overflow-x-auto p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 h-64 overflow-y-auto custom-scrollbar">
                        {cleanedLines.map((line, i) => <div key={i} className="py-0.5">{line || <span className="text-emerald-500/40 italic">¶</span>}</div>)}
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
        <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/20 dark:border-white/5">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                Optimization Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {items.length > 0 ? items.map((item, idx) => (
                    <div key={item.label} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-black/20 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-brand-500/10">
                        <span className="block text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600 dark:from-brand-400 dark:to-purple-400 mb-1">{item.value}</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight block">{item.label}</span>
                    </div>
                )) : <p className="text-gray-500 col-span-full">No major changes detected.</p>}
            </div>
        </div>
    );
};

const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    if (reportEntries.length === 0) return (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 p-6 rounded-2xl flex items-center gap-4" role="alert">
            <div className="p-3 bg-emerald-500/20 rounded-full"><CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
            <div>
                <p className="font-bold text-lg">Clean Content</p>
                <p className="text-sm opacity-80">No foreign languages detected.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-6 rounded-3xl" role="alert">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-xl"><AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
                <p className="font-bold text-lg">Foreign Language Detection</p>
            </div>
            <div className="mt-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="sticky top-0 bg-amber-100/90 dark:bg-amber-900/90 backdrop-blur-md z-10">
                        <tr><th className="p-3 rounded-tl-xl">Line</th><th className="p-3">Detected</th><th className="p-3 rounded-tr-xl">Preview</th></tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/50 dark:divide-amber-800/50">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum} className="hover:bg-amber-500/5 transition-colors">
                                <td className="p-3 font-mono text-amber-700 dark:text-amber-400">{lineNum}</td>
                                <td className="p-3 py-4">
                                    <span className="px-2 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-md text-xs font-bold uppercase tracking-wider">{info.languages.join(', ')}</span>
                                </td>
                                <td className="p-3 font-mono truncate max-w-sm opacity-80">{info.line}</td>
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-fade-in">
            <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/5 order-2 xl:order-1">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
                    <Calculator className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-6">Add New Entry</h3>
                <form onSubmit={handleAddEntry} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Lines Translated</label>
                        <input type="number" value={lines} onChange={e => setLines(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400" placeholder="e.g. 500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Rate (MMK per line)</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400" placeholder="e.g. 100" required />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all flex justify-center items-center gap-2">
                        <span>Save Entry</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="xl:col-span-2 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/5 order-1 xl:order-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-gray-100 dark:border-gray-800/60 pb-8">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white">Recent Earnings</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 rounded-2xl shadow-lg shadow-emerald-500/30">
                        <div className="bg-white dark:bg-dark-surface rounded-xl px-6 py-4 flex flex-col items-end sm:items-center h-full">
                            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">Monthly Total</span>
                            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-200">
                                {currentMonthData.total.toLocaleString()} <span className="text-lg opacity-70">MMK</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {currentMonthData.entries.map(entry => (
                        <div key={entry.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/60 group hover:border-brand-500/50 transition-all duration-300">
                            <div className="mb-3 sm:mb-0">
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    {entry.lines.toLocaleString()} lines
                                    <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">@ {entry.rate}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(entry.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">{entry.amount.toLocaleString()} MMK</p>
                                <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-100 dark:border-red-500/20 shadow-sm"
                                    title="Delete entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {currentMonthData.entries.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                            <Calculator className="w-16 h-16 mb-4 text-gray-400" />
                            <p className="text-lg font-bold">No entries yet</p>
                            <p className="text-sm">Add your first translation entry to start tracking.</p>
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

        const accessKey = "d6be84f4-63ed-4347-b06c-fe7048ffa2ac";

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ access_key: accessKey, subject: `Toolkit Issue Report: Anonymous`, name: 'Anonymous', message: issue }),
            });
            const result = await response.json();
            if (result.success) {
                setSubmitStatus('success'); setIssue(''); setTimeout(() => setSubmitStatus('idle'), 5000);
            } else { setSubmitStatus('error'); }
        } catch (error) { setSubmitStatus('error'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 bg-brand-500/10 w-40 h-40 rounded-full blur-3xl"></div>

                <h2 className="text-2xl font-black mb-6 flex items-center gap-4">
                    <div className="p-3 bg-brand-500/10 rounded-xl"><LinkIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" /></div>
                    Resources Drive
                </h2>

                <a href={driveLink} target="_blank" rel="noopener noreferrer" className="block p-6 bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-brand-500/25 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-full bg-white/10 skew-x-12 -mr-16 group-hover:mr-0 transition-all duration-700"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-white text-xl">Open Toolkit Drive</h3>
                            <p className="text-white/80 mt-1">Essential apps, installers, and tutorials</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </a>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/5">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl"><Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" /></div>
                        Hiddify VPN Keys
                    </h2>
                    <div className="mb-8 p-5 bg-violet-50 dark:bg-violet-500/5 rounded-2xl border border-violet-100 dark:border-violet-500/20">
                        <h4 className="font-bold text-violet-800 dark:text-violet-300 mb-2">Setup Instructions</h4>
                        <p className="text-sm text-violet-700/80 dark:text-violet-300/80 mb-4">Download using one of the mirrors, install, and copy a key below. Remove old keys before importing new ones for best speed.</p>
                        <div className="flex flex-wrap gap-3">
                            <a href="https://limewire.com/d/6ZcJw#cMZPd7rz3B" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-dark-bg rounded-xl font-bold text-sm text-violet-600 shadow-sm border border-violet-100 dark:border-violet-500/20 hover:border-violet-300 transition-colors">LimeWire</a>
                            <a href="https://t.me/+BfyZ73a7lbcyM2Rl" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-dark-bg rounded-xl font-bold text-sm text-violet-600 shadow-sm border border-violet-100 dark:border-violet-500/20 hover:border-violet-300 transition-colors">Telegram</a>
                            <a href="https://hiddify.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-dark-bg rounded-xl font-bold text-sm text-violet-600 shadow-sm border border-violet-100 dark:border-violet-500/20 hover:border-violet-300 transition-colors">Official Site</a>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'VLESS (Recommended)', key: hiddifyKeyVless },
                            { name: 'VMESS (Fallback)', key: hiddifyKeyVmess }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 relative">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">{item.name}</h4>
                                <div className="flex gap-3">
                                    <code className="flex-1 overflow-x-auto p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-500 break-all h-24 custom-scrollbar">
                                        {item.key}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(item.key, item.name)}
                                        className={cn("px-6 font-bold rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-2",
                                            copiedId === item.name ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:text-brand-600"
                                        )}
                                    >
                                        {copiedId === item.name ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                        {copiedId === item.name ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/5">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-4">
                        <div className="p-3 bg-brand-500/10 rounded-xl"><MessageSquare className="w-6 h-6 text-brand-600 dark:text-brand-400" /></div>
                        Report for an Issue
                    </h2>
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Message / Issue Report</label>
                            <textarea
                                value={issue}
                                onChange={e => setIssue(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y custom-scrollbar"
                                placeholder="Describe your issue or send a message..."
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:from-gray-400 disabled:to-gray-300 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:shadow-none transition-all flex justify-center items-center gap-2"
                        >
                            <span>{isSubmitting ? 'Sending...' : 'Send Report'}</span>
                            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                        </button>
                        {submitStatus === 'success' && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl animate-fade-in">
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Message sent successfully!</p>
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-fade-in">
                                <p className="text-red-600 dark:text-red-400 text-sm font-bold text-center flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> Failed to send message. Please try again.</p>
                            </div>
                        )}
                    </form>
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
    const [showQuotes, setShowQuotes] = useState<boolean>(() => {
        const saved = localStorage.getItem('showQuotes');
        return saved !== 'false';
    });

    const toggleQuotes = () => {
        const newState = !showQuotes;
        setShowQuotes(newState);
        localStorage.setItem('showQuotes', String(newState));
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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-lighten animate-blob"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
                <header className="mb-12">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500 dark:from-brand-400 dark:via-purple-400 dark:to-brand-300 pb-2">
                            Translator's Toolkit
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Streamline your subtitle workflow instantly.</p>

                        <div className="relative mt-2 flex flex-col items-center">
                            {showQuotes && <DailyQuote />}
                            <button
                                onClick={toggleQuotes}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 transition-colors text-sm font-medium mt-2",
                                    showQuotes
                                        ? "hover:bg-gray-200/50 dark:hover:bg-gray-800/50 opacity-50 hover:opacity-100"
                                        : "hover:bg-gray-200 dark:hover:bg-gray-800 opacity-100 bg-white/50 dark:bg-dark-surface/50 border border-gray-200 dark:border-gray-800 shadow-sm"
                                )}
                            >
                                {showQuotes ? (
                                    <><EyeOff className="w-4 h-4" /> <span>Hide</span></>
                                ) : (
                                    <><Eye className="w-4 h-4" /> Show</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-center">
                        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/20 dark:border-white/5 inline-flex gap-2">
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
                                            ? "bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:hover:bg-white/50 dark:hover:bg-white/5"
                                    )}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="flex-1 pb-16">
                    {activeView === 'cleaner' && (
                        appState === 'idle' ? <FileUpload onFileSelect={handleFileSelect} disabled={false} /> :
                            originalContent && cleanedContent && summary && foreignReport && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20 dark:border-white/5 sticky top-6 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-emerald-500 w-6 h-6" /> Review Changes</h2>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <button onClick={() => setAppState('idle')} className="flex-1 sm:flex-none px-6 py-3 font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Start Over</button>
                                            <button onClick={handleDownload} className="flex-1 sm:flex-none px-8 py-3 font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all">
                                                <Download className="w-5 h-5" /> Download Corrected
                                            </button>
                                        </div>
                                    </div>
                                    <Preview originalContent={originalContent} cleanedContent={cleanedContent} summary={summary} foreignReport={foreignReport} />
                                </div>
                            )
                    )}
                    {activeView === 'tracker' && <IncomeTracker />}
                    {activeView === 'guide' && <Guide />}
                </main>
                <footer className="mt-auto text-center py-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Translator's Toolkit • v2.0 Premium Design</p>
                </footer>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                .animate-blob { animation: blob 10s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
}
