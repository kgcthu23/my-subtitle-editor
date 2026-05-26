import React, { useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, FileCode, Copy } from 'lucide-react';
import type { ChangeSummary, ForeignLanguageReport, DetectedLanguageInfo } from '../types';
import { toast } from '../hooks/useToast';

export const ChangeSummaryDisplay: React.FC<{ summary: ChangeSummary }> = ({ summary }) => {
    const items = [
        { label: 'Formatting Corrections', value: summary.formatFixes, color: 'text-indigo-400' },
        { label: 'Backslashes Cleaned', value: summary.backslashesRemoved, color: 'text-violet-400' },
        { label: 'Timestamps Adjusted', value: summary.timestampsFixed, color: 'text-sky-400' },
        { label: 'HTML Tags Normalized', value: summary.htmlTagsFixed, color: 'text-blue-400' },
        { label: 'Square Brackets Stripped', value: summary.bracketsRemoved, color: 'text-pink-400' },
        { label: 'Parentheses Stripped', value: summary.parensRemoved, color: 'text-rose-400' },
        { label: 'Speaker Labels Removed', value: summary.speakerLabelsRemoved, color: 'text-amber-400' },
        { label: 'Dialogue Lines Split', value: summary.dialoguesSplit, color: 'text-emerald-400' },
        { label: 'Myanmar Characters Removed', value: summary.myanmarCharsRemoved, color: 'text-teal-400' },
        { label: 'Hyphen Lines Cleaned', value: summary.hyphensRemoved, color: 'text-zinc-400' },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/80">
            <h3 className="text-base font-bold text-zinc-200 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Cleanup Statistics
            </h3>
            
            {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {items.map(item => (
                        <div key={item.label} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between group hover:border-zinc-800/60 transition-colors shadow-inner">
                            <span className={`block text-2xl font-black ${item.color} mb-1.5 group-hover:scale-105 transition-transform origin-left`}>
                                {item.value}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider leading-normal">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-500 text-sm italic">No changes were required. The subtitle matches all clean standards!</p>
            )}
        </div>
    );
};

export const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    
    if (reportEntries.length === 0) {
        return (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 px-5 py-4.5 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-md" role="alert">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-sm text-emerald-300">Clean Subtitle Checklist</h4>
                    <p className="text-xs text-emerald-400/80 mt-0.5">No foreign languages detected. Subtitles are translation-ready.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-950/15 border border-amber-900/35 text-amber-200 p-6 rounded-xl backdrop-blur-md shadow-md" role="alert">
            <div className="flex items-center gap-2.5 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-sm text-amber-400">Foreign Words Flagged</h3>
                    <p className="text-xs text-amber-400/70 mt-0.5">Found lines with non-English/non-Burmese scripts. Double-check these timestamps:</p>
                </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar border border-amber-900/20 rounded-lg bg-zinc-950/40">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-zinc-950 border-b border-amber-900/20 z-10">
                        <tr>
                            <th className="p-3 font-bold text-amber-500/80 uppercase tracking-wider text-[10px]">Line</th>
                            <th className="p-3 font-bold text-amber-500/80 uppercase tracking-wider text-[10px]">Scripts</th>
                            <th className="p-3 font-bold text-amber-500/80 uppercase tracking-wider text-[10px]">Text Segment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/10">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum} className="hover:bg-amber-900/5 transition-colors">
                                <td className="p-3 font-mono font-semibold text-amber-600/90">{lineNum}</td>
                                <td className="p-3 font-bold text-amber-400/90">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px]">
                                        {info.languages.join(', ')}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-zinc-300 truncate max-w-[200px] sm:max-w-md">{info.line}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Preview: React.FC<{ originalContent: string; cleanedContent: string; summary: ChangeSummary; foreignReport: ForeignLanguageReport }> = ({ originalContent, cleanedContent, summary, foreignReport }) => {
    const originalLines = useMemo(() => originalContent.split('\n').slice(0, 20), [originalContent]);
    const cleanedLines = useMemo(() => cleanedContent.split('\n').slice(0, 20), [cleanedContent]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original View */}
                <div className="bg-zinc-950/60 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-900 overflow-hidden flex flex-col h-[350px]">
                    <div className="bg-zinc-900/40 px-5 py-3.5 border-b border-zinc-900/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                            Original Subtitle
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">First 20 lines</span>
                    </div>
                    <div className="p-5 overflow-auto custom-scrollbar flex-1 font-mono text-xs text-zinc-500 select-none bg-zinc-950/20 leading-relaxed">
                        {originalLines.map((line, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="w-6 text-zinc-700 text-right select-none pr-1.5 border-r border-zinc-900 text-[10px] mt-0.5">{i + 1}</span>
                                <span className="min-h-[1.25rem] truncate">{line || ' '}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cleaned View */}
                <div className="bg-zinc-950/60 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-900 overflow-hidden flex flex-col h-[350px] relative before:absolute before:inset-0 before:rounded-2xl before:border before:border-indigo-500/10 before:pointer-events-none">
                    <div className="bg-zinc-900/40 px-5 py-3.5 border-b border-zinc-900/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                            Refined Subtitle
                        </span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(cleanedContent);
                                    toast.success('Cleaned subtitle copied!');
                                }}
                                className="text-[10px] flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20 cursor-pointer"
                                title="Copy to clipboard"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                            <span className="text-[10px] font-mono text-indigo-500/80 uppercase">Preview</span>
                        </div>
                    </div>
                    <div className="p-5 overflow-auto custom-scrollbar flex-1 font-mono text-xs text-indigo-200/90 leading-relaxed bg-zinc-950/10">
                        {cleanedLines.map((line, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="w-6 text-indigo-950 text-right select-none pr-1.5 border-r border-zinc-900 text-[10px] mt-0.5">{i + 1}</span>
                                <span className="min-h-[1.25rem] truncate">{line || ' '}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ChangeSummaryDisplay summary={summary} />
            <ForeignLanguageReportDisplay report={foreignReport} />
        </div>
    );
};
