import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Copy, Download, RefreshCw, SlidersHorizontal, Eye, FileCheck, FileText, Layers } from 'lucide-react';
import type { ChangeSummary, ForeignLanguageReport, DetectedLanguageInfo, CleanerOptions, CleanedFileItem } from '../types';
import { toast } from '../hooks/useToast';

interface PreviewProps {
    files: CleanedFileItem[];
    activeFileIndex: number;
    setActiveFileIndex: (index: number) => void;
    options: CleanerOptions;
    onOptionsChange: (newOptions: CleanerOptions) => void;
    onReset: () => void;
    onDownloadSingle: (index: number) => void;
    onDownloadAll: () => void;
}

export const CleanerOptionsToggle: React.FC<{ options: CleanerOptions; onChange: (options: CleanerOptions) => void }> = ({ options, onChange }) => {
    const optionItems: { key: keyof CleanerOptions; label: string; desc: string }[] = [
        { key: 'removeSpeakerLabels', label: 'Speaker Labels', desc: 'Remove "Speaker 1:", "စကားပြောသူ:"' },
        { key: 'stripBrackets', label: 'Square Brackets', desc: 'Remove "[Laughs]", "[Noise]"' },
        { key: 'stripParens', label: 'Parentheses', desc: 'Remove "(chuckles)", "(screams)"' },
        { key: 'removeUntranslatedEnglish', label: 'Pure English Lines', desc: 'Filter out untranslated English text' },
        { key: 'splitDialogues', label: 'Split Dialogues', desc: 'Separate dual dialogue lines' },
        { key: 'removeMyanmarSpecialChars', label: 'Myanmar Punctuation', desc: 'Remove "။" (ပုဒ်မ) and "၊" (ပုဒ်ဖြတ်)' },
        { key: 'removeExclamationAndQuestion', label: 'Exclamation & Question', desc: 'Remove "!" and "?" marks' },
        { key: 'removeBackslashes', label: 'Backslash Escapes', desc: 'Clean "--\\>" and "<b\\>"' },
        { key: 'fixTimestamps', label: 'Format Auto-Repair', desc: 'Fix merged lines & missing blank lines' },
    ];

    const toggleOption = (key: keyof CleanerOptions) => {
        onChange({ ...options, [key]: !options[key] });
    };

    return (
        <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Active Cleaner Rules</h4>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Toggle rules to re-clean in real-time</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {optionItems.map(item => (
                    <button
                        key={item.key}
                        onClick={() => toggleOption(item.key)}
                        type="button"
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer select-none ${
                            options[item.key]
                                ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-bold">{item.label}</p>
                            <p className="text-[10px] opacity-75 mt-0.5">{item.desc}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${options[item.key] ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-zinc-700'}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export const ChangeSummaryDisplay: React.FC<{ summary: ChangeSummary }> = ({ summary }) => {
    const items = [
        { label: 'Formatting Corrections', value: summary.formatFixes, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Backslashes Cleaned', value: summary.backslashesRemoved, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { label: 'Timestamps Adjusted', value: summary.timestampsFixed, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { label: 'HTML Tags Normalized', value: summary.htmlTagsFixed, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Square Brackets Stripped', value: summary.bracketsRemoved, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { label: 'Parentheses Stripped', value: summary.parensRemoved, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { label: 'Speaker Labels Removed', value: summary.speakerLabelsRemoved, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'English Lines Removed', value: summary.englishLinesRemoved, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: 'Dialogue Lines Split', value: summary.dialoguesSplit, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Myanmar Punctuation (။ & ၊)', value: summary.myanmarCharsRemoved, color: 'text-teal-400', bg: 'bg-teal-500/10' },
        { label: 'Punctuation (! & ?)', value: summary.exclamationAndQuestionsRemoved, color: 'text-amber-300', bg: 'bg-amber-500/10' },
        { label: 'Hyphen Lines Cleaned', value: summary.hyphensRemoved, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/90">
            <h3 className="text-sm font-bold text-zinc-200 mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Refinement Summary Statistics
            </h3>
            
            {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {items.map(item => (
                        <div key={item.label} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl flex flex-col justify-between group hover:border-zinc-700 transition-colors">
                            <span className={`block text-xl font-black ${item.color} mb-1 group-hover:scale-105 transition-transform origin-left`}>
                                {item.value}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>No structural changes required. The input subtitle strictly matches all formatting standards!</span>
                </div>
            )}
        </div>
    );
};

export const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    
    if (reportEntries.length === 0) {
        return (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 px-5 py-4 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-xs text-emerald-300">Clean Language Inspection Passed</h4>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">No untranslated Thai, Chinese, Japanese, Korean, Arabic, or Hindi scripts detected.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-950/20 border border-amber-900/40 text-amber-200 p-5 rounded-2xl backdrop-blur-md shadow-md space-y-3">
            <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-xs text-amber-300">Foreign Scripts Flagged ({reportEntries.length})</h3>
                    <p className="text-[11px] text-amber-400/70 mt-0.5">Review lines containing foreign language characters:</p>
                </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-amber-900/30 rounded-xl bg-zinc-950/60">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-zinc-950 border-b border-amber-900/30 z-10">
                        <tr>
                            <th className="p-3 font-bold text-amber-400 uppercase tracking-wider text-[10px]">Line</th>
                            <th className="p-3 font-bold text-amber-400 uppercase tracking-wider text-[10px]">Detected Script</th>
                            <th className="p-3 font-bold text-amber-400 uppercase tracking-wider text-[10px]">Segment Snippet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/20 font-mono text-[11px]">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum} className="hover:bg-amber-900/10 transition-colors">
                                <td className="p-3 font-bold text-amber-400">{lineNum}</td>
                                <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-sans font-semibold">
                                        {info.languages.join(', ')}
                                    </span>
                                </td>
                                <td className="p-3 text-zinc-300 truncate max-w-[250px] sm:max-w-md">{info.line}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Preview: React.FC<PreviewProps> = ({
    files,
    activeFileIndex,
    setActiveFileIndex,
    options,
    onOptionsChange,
    onReset,
    onDownloadSingle,
    onDownloadAll
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [viewFullText, setViewFullText] = useState(false);

    const activeFile = files[activeFileIndex] || files[0];
    const originalContent = activeFile?.originalContent || '';
    const cleanedContent = activeFile?.cleanedContent || '';
    const summary = activeFile?.summary || {
        backslashesRemoved: 0, timestampsFixed: 0, htmlTagsFixed: 0, bracketsRemoved: 0, parensRemoved: 0,
        speakerLabelsRemoved: 0, hyphensRemoved: 0, myanmarCharsRemoved: 0, exclamationAndQuestionsRemoved: 0,
        dialoguesSplit: 0, englishLinesRemoved: 0, foreignLinesCount: 0, formatFixes: 0
    };
    const foreignReport = activeFile?.foreignReport || {};

    const lineLimit = viewFullText ? 500 : 35;
    const originalLines = useMemo(() => originalContent.split('\n').slice(0, lineLimit), [originalContent, lineLimit]);
    const cleanedLines = useMemo(() => cleanedContent.split('\n').slice(0, lineLimit), [cleanedContent, lineLimit]);

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanedContent);
        toast.success(`Copied ${activeFile?.outputName || 'subtitle'} content!`);
    };

    return (
        <div className="space-y-6">
            {/* Batch Files Navigation Selector */}
            {files.length > 1 && (
                <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/90 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            Processed Subtitle Files ({files.length} Files Ready)
                        </span>
                        <button
                            onClick={onDownloadAll}
                            className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download All ({files.length} Files)
                        </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {files.map((file, idx) => (
                            <button
                                key={file.id}
                                onClick={() => setActiveFileIndex(idx)}
                                className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                                    activeFileIndex === idx
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[160px]">{file.outputName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Action & Control Header */}
            <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">Subtitle Comparison & Download</h2>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300 font-bold">
                                {activeFile?.outputName}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">Inspect side-by-side diffs and download cleaned <span className="font-mono text-indigo-300">-mmsub</span> files.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                            showOptions
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                        }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Cleaner Options
                    </button>

                    <button
                        onClick={onReset}
                        className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                        Clean Another
                    </button>

                    <button
                        onClick={handleCopy}
                        className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-indigo-200 border border-zinc-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        Copy SRT
                    </button>

                    {files.length > 1 && (
                        <button
                            onClick={onDownloadAll}
                            className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download All ({files.length})
                        </button>
                    )}

                    <button
                        onClick={() => onDownloadSingle(activeFileIndex)}
                        className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download {activeFile?.outputName || 'SRT'}
                    </button>
                </div>
            </div>

            {/* Optional Rules Drawer */}
            {showOptions && (
                <CleanerOptionsToggle options={options} onChange={onOptionsChange} />
            )}

            {/* Side-by-side Viewers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original View */}
                <div className="bg-zinc-950/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-800/90 overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-zinc-900/60 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                            Original: {activeFile?.originalName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Lines 1-{originalLines.length}</span>
                    </div>
                    <div className="p-4 overflow-auto custom-scrollbar flex-1 font-mono text-xs text-zinc-400 leading-relaxed bg-zinc-950/40">
                        {originalLines.map((line, i) => (
                            <div key={i} className="flex gap-3 hover:bg-zinc-900/30 px-1 py-0.5 rounded">
                                <span className="w-8 text-zinc-600 text-right select-none text-[10px] pt-0.5 border-r border-zinc-800/60 pr-2">{i + 1}</span>
                                <span className="truncate flex-1 font-mono">{line || ' '}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Refined View */}
                <div className="bg-zinc-950/80 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-500/30 overflow-hidden flex flex-col h-[400px] relative">
                    <div className="bg-indigo-950/40 px-5 py-3 border-b border-indigo-500/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                            Output: {activeFile?.outputName}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewFullText(!viewFullText)}
                                className="text-[10px] font-semibold text-indigo-300 hover:text-white px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <Eye className="w-3 h-3" />
                                {viewFullText ? 'Show Top Lines' : 'Expand View'}
                            </button>
                        </div>
                    </div>
                    <div className="p-4 overflow-auto custom-scrollbar flex-1 font-mono text-xs text-indigo-100/90 leading-relaxed bg-zinc-950/20">
                        {cleanedLines.map((line, i) => (
                            <div key={i} className="flex gap-3 hover:bg-indigo-950/30 px-1 py-0.5 rounded">
                                <span className="w-8 text-indigo-950 text-right select-none text-[10px] pt-0.5 border-r border-indigo-900/40 pr-2">{i + 1}</span>
                                <span className="truncate flex-1 font-mono">{line || ' '}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics Breakdown */}
            <ChangeSummaryDisplay summary={summary} />

            {/* Foreign Script Report */}
            <ForeignLanguageReportDisplay report={foreignReport} />
        </div>
    );
};
