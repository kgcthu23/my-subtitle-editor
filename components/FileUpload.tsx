import React from 'react';
import { UploadCloud } from 'lucide-react';

export const FileUpload: React.FC<{ onFileSelect: (content: string, fileName: string) => void; disabled: boolean }> = ({ onFileSelect, disabled }) => {
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
            <label htmlFor="file-upload" className="relative cursor-pointer bg-zinc-900/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center p-14 hover:bg-zinc-800/60 transition-all duration-300 group shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                <UploadCloud className="w-10 h-10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <span className="mt-2 text-lg font-semibold text-zinc-200">Click to upload or drag and drop</span>
                <span className="text-sm text-zinc-500 mt-1">SRT files only</span>
                <input id="file-upload" type="file" className="sr-only" accept=".srt" onChange={handleFileChange} disabled={disabled} />
            </label>
        </div>
    );
};
