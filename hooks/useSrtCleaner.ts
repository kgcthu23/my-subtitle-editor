import { useState, useCallback } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary, SAMPLE_SRT_CONTENT } from '../services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport, CleanerOptions, CleanedFileItem } from '../types';
import { DEFAULT_CLEANER_OPTIONS } from '../types';

export function useSrtCleaner() {
    const [files, setFiles] = useState<CleanedFileItem[]>([]);
    const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [options, setOptions] = useState<CleanerOptions>(DEFAULT_CLEANER_OPTIONS);

    const processRawFiles = useCallback((rawFiles: { name: string; content: string }[], currentOptions: CleanerOptions = options) => {
        const processedItems: CleanedFileItem[] = rawFiles.map((file, idx) => {
            const baseName = file.name.replace(/\.srt$/i, '');
            const outputName = `${baseName}-mmsub.srt`;
            const cleaned = cleanSrtContent(file.content, currentOptions);
            const summary = getChangeSummary(file.content, currentOptions);
            const foreignReport = detectForeignLanguages(cleaned);

            return {
                id: `${baseName}-${idx}-${Date.now()}`,
                originalName: file.name,
                outputName,
                originalContent: file.content,
                cleanedContent: cleaned,
                summary,
                foreignReport
            };
        });

        setFiles(processedItems);
        setActiveFileIndex(0);
    }, [options]);

    const handleMultipleFilesSelect = useCallback((rawFiles: { name: string; content: string }[]) => {
        processRawFiles(rawFiles, options);
    }, [processRawFiles, options]);

    const loadSampleSrt = useCallback(() => {
        processRawFiles([{ name: 'sample_demo.srt', content: SAMPLE_SRT_CONTENT }], options);
    }, [processRawFiles, options]);

    const updateOptions = useCallback((newOptions: CleanerOptions) => {
        setOptions(newOptions);
        if (files.length > 0) {
            const reprocessed = files.map(file => {
                const cleaned = cleanSrtContent(file.originalContent, newOptions);
                const summary = getChangeSummary(file.originalContent, newOptions);
                const foreignReport = detectForeignLanguages(cleaned);
                return {
                    ...file,
                    cleanedContent: cleaned,
                    summary,
                    foreignReport
                };
            });
            setFiles(reprocessed);
        }
    }, [files]);

    const downloadSingleFile = useCallback((index: number = activeFileIndex) => {
        const target = files[index];
        if (!target || !target.cleanedContent) return;

        const blob = new Blob([target.cleanedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = target.outputName;
        link.click();
        URL.revokeObjectURL(url);
    }, [files, activeFileIndex]);

    const downloadAllFiles = useCallback(() => {
        if (files.length === 0) return;
        files.forEach((file, idx) => {
            setTimeout(() => {
                const blob = new Blob([file.cleanedContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.outputName;
                link.click();
                URL.revokeObjectURL(url);
            }, idx * 250);
        });
    }, [files]);

    const resetCleaner = useCallback(() => {
        setFiles([]);
        setActiveFileIndex(0);
    }, []);

    const activeFile = files[activeFileIndex] || null;

    return {
        files,
        activeFile,
        activeFileIndex,
        setActiveFileIndex,
        isCleaned: files.length > 0,
        options,
        updateOptions,
        handleMultipleFilesSelect,
        loadSampleSrt,
        downloadSingleFile,
        downloadAllFiles,
        resetCleaner
    };
}
