import React, { useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ChangeSummary, ForeignLanguageReport, DetectedLanguageInfo } from '../types';

export const ChangeSummaryDisplay: React.FC<{ summary: ChangeSummary }> = ({ summary }) => {
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
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-zinc-800/50">
            <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Summary of Changes
            </h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.length > 0 ? items.map(item => (
                    <li key={item.label} className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-colors">
                        <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mb-1 group-hover:scale-105 transition-transform origin-left drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">{item.value}</span>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider leading-tight">{item.label}</span>
                    </li>
                )) : <p className="text-zinc-500 italic">No major changes detected.</p>}
            </ul>
        </div>
    );
};

export const ForeignLanguageReportDisplay: React.FC<{ report: ForeignLanguageReport }> = ({ report }) => {
    const reportEntries = Object.keys(report).map((key) => [key, report[key]]) as [string, DetectedLanguageInfo][];
    if (reportEntries.length === 0) return (
        <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 px-5 py-4 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-[0_4px_20px_rgba(16,185,129,0.05)]" role="alert">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">No foreign languages detected. All clean!</p>
        </div>
    );

    return (
        <div className="bg-amber-950/30 border border-amber-900/50 text-amber-200 p-5 rounded-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(245,158,11,0.05)]" role="alert">
            <div className="flex items-center mb-4"><AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" /><h3 className="font-bold text-amber-400">Foreign Language Detection</h3></div>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-amber-950/90 backdrop-blur-sm z-10 border-b border-amber-900/50">
                        <tr><th className="p-3 font-semibold text-amber-500/70">Line</th><th className="p-3 font-semibold text-amber-500/70">Detected</th><th className="p-3 font-semibold text-amber-500/70">Preview</th></tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/30">
                        {reportEntries.map(([lineNum, info]) => (
                            <tr key={lineNum} className="hover:bg-amber-900/10 transition-colors">
                                <td className="p-3 font-mono text-amber-600">{lineNum}</td>
                                <td className="p-3 font-medium text-amber-300">{info.languages.join(', ')}</td>
                                <td className="p-3 font-mono text-amber-100/70 truncate max-w-[200px] sm:max-w-xs">{info.line}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Preview: React.FC<{ originalContent: string; cleanedContent: string; summary: ChangeSummary; foreignReport: ForeignLanguageReport }> = ({ originalContent, cleanedContent, summary, foreignReport }) => {
    const originalLines = useMemo(() => originalContent.split('\n').slice(0, 15), [originalContent]);
    const cleanedLines = useMemo(() => cleanedContent.split('\n').slice(0, 15), [cleanedContent]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800/80 overflow-hidden flex flex-col">
                    <div className="bg-zinc-950/50 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-500"></div>Original</h3>
                    </div>
                    <pre className="text-xs text-zinc-400 overflow-x-auto p-4 flex-1">
                        {originalLines.map((line, i) => <div key={i} className="min-h-[1rem]">{line || ' '}</div>)}
                    </pre>
                </div>
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800/80 overflow-hidden flex flex-col relative before:absolute before:inset-0 before:rounded-xl before:border before:border-emerald-500/20 before:pointer-events-none">
                    <div className="bg-zinc-950/50 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>Cleaned</h3>
                    </div>
                    <pre className="text-xs text-emerald-300/90 overflow-x-auto p-4 flex-1">
                        {cleanedLines.map((line, i) => <div key={i} className="min-h-[1rem]">{line || ' '}</div>)}
                    </pre>
                </div>
            </div>
            <ChangeSummaryDisplay summary={summary} />
            <ForeignLanguageReportDisplay report={foreignReport} />
        </div>
    );
};
