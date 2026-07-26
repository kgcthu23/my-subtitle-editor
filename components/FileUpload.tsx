import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle, Shield, Zap, RefreshCw } from 'lucide-react';
import { toast } from '../hooks/useToast';

interface FileUploadProps {
    onFilesSelect: (files: { name: string; content: string }[]) => void;
    onLoadSample: () => void;
    disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, onLoadSample, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const processFilesList = useCallback((files: FileList | File[]) => {
        const srtFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.srt'));
        if (srtFiles.length === 0) {
            toast.error('Invalid format! Please upload .SRT subtitle files.');
            return;
        }

        const readResults: { name: string; content: string }[] = [];
        let readCount = 0;

        srtFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (content && content.trim()) {
                    readResults.push({ name: file.name, content });
                }
                readCount++;
                if (readCount === srtFiles.length) {
                    if (readResults.length === 0) {
                        toast.error('Selected files are empty.');
                    } else {
                        onFilesSelect(readResults);
                        toast.success(`Loaded ${readResults.length} SRT file${readResults.length > 1 ? 's' : ''} successfully!`);
                    }
                }
            };
            reader.readAsText(file, 'UTF-8');
        });
    }, [onFilesSelect]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) processFilesList(files);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) processFilesList(files);
    }, [disabled, processFilesList]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                    Multi-File SRT Subtitle Refinement Engine
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Clean & Format Subtitles in Seconds
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                    Upload single or multiple SRT files. Output names are automatically appended with <code className="text-indigo-300 font-mono font-bold">-mmsub</code> (e.g. <span className="font-mono text-zinc-300">Ep01-mmsub.srt</span>).
                </p>
            </div>

            {/* Drop Zone Box */}
            <div className="relative group">
                <div className={`absolute -inset-1 rounded-3xl blur-xl transition duration-500 opacity-60 ${
                    isDragging 
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90' 
                        : 'bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-indigo-500/30 group-hover:opacity-100'
                }`}></div>

                <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                    isDragging 
                        ? 'bg-indigo-950/50 border-indigo-400 scale-[1.01] shadow-[0_0_40px_rgba(99,102,241,0.25)]' 
                        : 'bg-zinc-950/80 border-zinc-800/90 group-hover:border-zinc-700/80'
                }`}>
                    <label 
                        htmlFor="file-upload" 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className="relative cursor-pointer p-10 sm:p-16 flex flex-col items-center justify-center text-center transition-all"
                    >
                        <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-300 ${
                            isDragging 
                                ? 'bg-indigo-500/20 border-indigo-400 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]' 
                                : 'bg-indigo-600/10 border-indigo-500/20 group-hover:scale-105 group-hover:bg-indigo-600/20 group-hover:border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        }`}>
                            <UploadCloud className={`w-10 h-10 transition-colors drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] ${
                                isDragging ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-200'
                            }`} />
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            {isDragging ? 'Drop your SRT file(s) here!' : 'Drop one or multiple .SRT files here or browse'}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-6">
                            Upload single or multiple files at once. All cleaning rules apply automatically with <span className="text-indigo-300 font-mono font-bold">-mmsub</span> naming.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                Single & Batch SRT Upload
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                100% Private (Client-Side)
                            </div>
                        </div>

                        <input 
                            id="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept=".srt" 
                            multiple
                            onChange={handleFileChange} 
                            disabled={disabled} 
                        />
                    </label>

                    {/* Quick Demo Button */}
                    <div className="bg-zinc-900/60 border-t border-zinc-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-zinc-400 font-medium">Don't have an SRT file handy? Try our test suite sample:</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onLoadSample();
                                toast.info('Loaded demo subtitle sample!');
                            }}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                            Try Demo Sample SRT
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    {
                        title: "Timestamp & Syntax Fix",
                        desc: "Repairs merged lines, missing blank line separators, backslash escape issues, and HTML tag brackets.",
                        icon: Sparkles,
                        color: "text-indigo-400"
                    },
                    {
                        title: "Myanmar & Speaker Cleanup",
                        desc: "Strips speaker names (စကားပြောသူ/Speaker 1:), bracketed noise labels [Laughs], and stray Burmese full stops.",
                        icon: CheckCircle,
                        color: "text-emerald-400"
                    },
                    {
                        title: "Foreign Script Inspector",
                        desc: "Flags Thai, Japanese, Chinese, Korean, and Hindi character occurrences line-by-line for fast verification.",
                        icon: Shield,
                        color: "text-amber-400"
                    }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="bg-zinc-950/60 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800/80 shadow-xl space-y-2 hover:border-zinc-700/80 transition-all">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                    <Icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
