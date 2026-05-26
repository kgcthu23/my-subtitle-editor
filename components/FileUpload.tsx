import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export const FileUpload: React.FC<{ onFileSelect: (content: string, fileName: string) => void; disabled: boolean }> = ({ onFileSelect, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const processFile = useCallback((file: File) => {
        if (!file.name.toLowerCase().endsWith('.srt')) {
            alert('Please upload an SRT file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => onFileSelect(e.target?.result as string, file.name);
        reader.readAsText(file, 'UTF-8');
    }, [onFileSelect]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) processFile(file);
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
        
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }, [disabled, processFile]);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className={`relative group overflow-hidden rounded-2xl p-[1px] transition-all duration-300 shadow-2xl ${
                isDragging 
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-400 to-indigo-600 scale-[1.02]' 
                    : 'bg-gradient-to-b from-zinc-800 via-zinc-800 to-indigo-500/30 hover:bg-gradient-to-b hover:from-indigo-500/30 hover:via-zinc-800 hover:to-indigo-500'
            }`}>
                <label 
                    htmlFor="file-upload" 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative cursor-pointer backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-14 sm:p-20 transition-all duration-300 group ${
                        isDragging ? 'bg-indigo-950/40' : 'bg-zinc-950/80 hover:bg-zinc-900/50'
                    }`}
                >
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-300 ${
                        isDragging 
                            ? 'bg-indigo-500/20 border-indigo-400/50 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                            : 'bg-indigo-600/10 border-indigo-500/20 group-hover:scale-105 group-hover:border-indigo-400/30 group-hover:bg-indigo-600/15 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                    }`}>
                        <UploadCloud className={`w-8 h-8 transition-colors drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] ${
                            isDragging ? 'text-indigo-200' : 'text-indigo-400 group-hover:text-indigo-300'
                        }`} />
                    </div>
                    
                    <span className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors text-center">
                        {isDragging ? 'Drop subtitle here!' : 'Upload Subtitle File'}
                    </span>
                    <span className="text-sm text-zinc-400 mt-2 text-center">
                        Drag and drop your subtitle or click to browse
                    </span>
                    
                    <div className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        SRT format only
                    </div>

                    <input 
                        id="file-upload" 
                        type="file" 
                        className="sr-only" 
                        accept=".srt" 
                        onChange={handleFileChange} 
                        disabled={disabled} 
                    />
                </label>
            </div>

            {/* Quick Process Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                {[
                    { title: "Upload Subtitle", desc: "Select any standard SRT format file." },
                    { title: "Auto-Refinement", desc: "Instantly fixes formatting and flags foreign lines." },
                    { title: "Review & Save", desc: "Inspect changes side-by-side and download." }
                ].map((step, index) => (
                    <div key={index} className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex flex-col sm:flex-row items-center sm:items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{step.title}</h4>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
