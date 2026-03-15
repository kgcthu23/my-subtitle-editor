import { useState, useCallback } from 'react';
import { cleanSrtContent, detectForeignLanguages, getChangeSummary } from '../services/srtCleaner';
import type { ChangeSummary, ForeignLanguageReport } from '../types';

export function useSrtCleaner() {
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [cleanedContent, setCleanedContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('cleaned.srt');
    const [summary, setSummary] = useState<ChangeSummary | null>(null);
    const [foreignReport, setForeignReport] = useState<ForeignLanguageReport | null>(null);
    const [isCleaned, setIsCleaned] = useState<boolean>(false);

    const handleFileSelect = useCallback((content: string, name: string) => {
        setOriginalContent(content);
        const cleaned = cleanSrtContent(content); 
        setCleanedContent(cleaned);
        const summaryData = getChangeSummary(content); 
        setSummary(summaryData);
        const reportData = detectForeignLanguages(cleaned); 
        setForeignReport(reportData);
        setFileName(name.replace(/\.srt$/i, '') + '_cleaned.srt');
        setIsCleaned(true);
    }, []);

    const handleDownload = useCallback(() => {
        if (!cleanedContent) return;
        const blob = new Blob([cleanedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); 
        link.href = url; 
        link.download = fileName;
        link.click(); 
        URL.revokeObjectURL(url);
    }, [cleanedContent, fileName]);

    const resetCleaner = useCallback(() => {
        setOriginalContent(null);
        setCleanedContent(null);
        setSummary(null);
        setForeignReport(null);
        setIsCleaned(false);
    }, []);

    return {
        originalContent,
        cleanedContent,
        summary,
        foreignReport,
        isCleaned,
        handleFileSelect,
        handleDownload,
        resetCleaner
    };
}
