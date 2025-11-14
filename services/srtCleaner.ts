import type { ForeignLanguageReport, ChangeSummary } from '../types';

const languagePatterns: { [key: string]: RegExp } = {
    'Thai': /[ก-๙]/,
    'Chinese': /[\u4e00-\u9fff]/,
    'Japanese': /[ぁ-んァ-ン一-龯]/,
    'Korean': /[ㄱ-ㅎㅏ-ㅣ가-힣]/,
    'Arabic': /[\u0600-\u06FF]/,
    'Hindi': /[\u0900-\u097F]/,
};

export const detectForeignLanguages = (content: string): ForeignLanguageReport => {
    const detectedLines: ForeignLanguageReport = {};
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const detectedLangs: string[] = [];
        for (const lang in languagePatterns) {
            if (languagePatterns[lang].test(line)) {
                detectedLangs.push(lang);
            }
        }

        if (detectedLangs.length > 0) {
            const trimmedLine = line.trim();
            detectedLines[lineNum] = {
                line: trimmedLine.length > 100 ? `${trimmedLine.substring(0, 100)}...` : trimmedLine,
                languages: detectedLangs,
            };
        }
    });

    return detectedLines;
};

const fixSrtFormat = (content: string): { fixedContent: string, count: number } => {
    const lines = content.split('\n');
    const formattedLines: string[] = [];
    let fixesCount = 0;
    
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        
        // Case 1: number, timestamp, and text are on the same line
        const fullMatch = line.match(/^(\d+)\s+((?:\d{2}:){2}\d{2},\d{3}\s*-->\s*(?:\d{2}:){2}\d{2},\d{3})\s*(.*)$/);
        if (fullMatch) {
            fixesCount++;
            const [, num, timestamp, text] = fullMatch;
            formattedLines.push(num, timestamp.trim());
            if (text.trim()) formattedLines.push(text.trim());
            formattedLines.push('');
            i++;
            continue;
        }

        // Case 2: line is a number, and the next line contains both timestamp and text
        if (line.match(/^\d+$/) && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            const tsTextMatch = nextLine.match(/^((?:\d{2}:){2}\d{2},\d{3}\s*-->\s*(?:\d{2}:){2}\d{2},\d{3})\s*(.*)$/);
            if(tsTextMatch) {
                fixesCount++;
                const [, timestamp, text] = tsTextMatch;
                formattedLines.push(line, timestamp.trim());
                if (text.trim()) formattedLines.push(text.trim());
                formattedLines.push('');
                i += 2;
                continue;
            }
        }
        
        formattedLines.push(lines[i]);
        i++;
    }
    
    const fixedContent = formattedLines.join('\n').replace(/(\r\n|\n|\r){3,}/g, '\n\n').trim();
    return { fixedContent, count: fixesCount };
};


export const cleanSrtContent = (content: string): string => {
    // 1. Fix major SRT format issues first
    let { fixedContent: cleaned } = fixSrtFormat(content);
    
    // 2. Remove backslashes from timestamps and HTML tags
    cleaned = cleaned.replace(/--\\>/g, '-->');
    cleaned = cleaned.replace(/<([^>]+)\\>/g, '<$1>');
    cleaned = cleaned.replace(/\\(.)/g, '$1');

    // 3. Remove text between square brackets and parentheses
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
    cleaned = cleaned.replace(/\([^)]*\)/g, '');

    // 4. Remove Myanmar character
    cleaned = cleaned.replace(/။/g, '');

    // 5. Remove speaker labels with more specific rules
    const speakerCleanedLines = cleaned.split('\n').map(line => {
        // Skip timestamp and number lines
        if (/^\d+$/.test(line.trim()) || /-->/.test(line.trim())) {
            return line;
        }
        let cleanedLine = line;
        // Burmese patterns: ကြေညာသူ (announcer), စကားပြောသူ (speaker), အသံ (voice), ဇာတ်ဆောင် (actor)
        cleanedLine = cleanedLine.replace(/^(ကြေညာသူ|စကားပြောသူ|အသံ|ဇာတ်ဆောင်)\s*[၀-၉]+\s*:\s*/, '');
        // English patterns from Python script
        cleanedLine = cleanedLine.replace(/^(Speaker\s*\d+|Narrator|Actor\s*\d+|Voice\s*\d+|Man|Woman|Boy|Girl):\s*/i, '');
        // Generic pattern from old file as a final catch-all for other cases like "JOHN:"
        cleanedLine = cleanedLine.replace(/^(?!.*\s-->\s)[^:\n]{1,30}:\s?/, '');
        return cleanedLine;
    });
    cleaned = speakerCleanedLines.join('\n');

    // 6. Split multiple dialogues on the same line
    const dialogueSplitLines: string[] = [];
    cleaned.split('\n').forEach(line => {
        const strippedLine = line.trim();
        if (strippedLine.startsWith('-') && strippedLine.includes(' -')) {
            const dialogues = strippedLine.split(' -').map((d, i) => (i > 0 ? `-${d.trim()}` : d.trim()));
            dialogueSplitLines.push(...dialogues);
        } else {
            dialogueSplitLines.push(line);
        }
    });
    cleaned = dialogueSplitLines.join('\n');
    
    // 7. Remove lines containing ONLY hyphens
    cleaned = cleaned.replace(/^[-\s]*$/gm, '');

    // 8. Final cleanup of multiple empty lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    return cleaned.trim();
};

export const getChangeSummary = (originalContent: string): ChangeSummary => {
    const cleanedContent = cleanSrtContent(originalContent);
    const foreignLanguages = detectForeignLanguages(cleanedContent);
    
    const { count: formatFixesCount } = fixSrtFormat(originalContent);
    
    // Calculate speaker labels removed by checking original content
    const burmeseSpeakerPattern = /^(ကြေညာသူ|စကားပြောသူ|အသံ|ဇာတ်ဆောင်)\s*[၀-၉]+\s*:\s*/gm;
    const englishSpeakerPattern = /^(Speaker\s*\d+|Narrator|Actor\s*\d+|Voice\s*\d+|Man|Woman|Boy|Girl):\s*/gim;
    const genericSpeakerPattern = /^(?!.*\s-->\s)[^:\n]{1,30}:\s?/gm;

    const burmeseMatches = (originalContent.match(burmeseSpeakerPattern) || []).length;
    const englishMatches = (originalContent.match(englishSpeakerPattern) || []).length;
    
    // Avoid double-counting by removing specific matches before checking for generic ones
    let tempContent = originalContent.replace(burmeseSpeakerPattern, '').replace(englishSpeakerPattern, '');
    const genericMatches = (tempContent.match(genericSpeakerPattern) || []).length;

    const speakerLabelsRemoved = burmeseMatches + englishMatches + genericMatches;

    return {
        formatFixes: formatFixesCount,
        backslashesRemoved: (originalContent.match(/\\/g) || []).length,
        timestampsFixed: (originalContent.match(/--\\>/g) || []).length,
        htmlTagsFixed: (originalContent.match(/<[^>]+\\>/g) || []).length,
        bracketsRemoved: (originalContent.match(/\[[^\]]*\]/g) || []).length,
        parensRemoved: (originalContent.match(/\([^)]*\)/g) || []).length,
        speakerLabelsRemoved,
        hyphensRemoved: (originalContent.match(/^[-\s]*$/gm) || []).length,
        myanmarCharsRemoved: (originalContent.match(/။/g) || []).length,
        dialoguesSplit: (originalContent.match(/^.* -.*$/gm) || []).length,
        foreignLinesCount: Object.keys(foreignLanguages).length,
    };
};
