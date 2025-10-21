
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

export const cleanSrtContent = (content: string): string => {
    let cleaned = content;

    // 1. Remove backslashes from timestamps (--> --> -->)
    cleaned = cleaned.replace(/--\\>/g, '-->');
    
    // 2. Remove backslashes from HTML tags (<\i> --> <i>)
    cleaned = cleaned.replace(/<([^>]+)\\>/g, '<$1>');
    
    // 3. Remove any other standalone backslashes
    cleaned = cleaned.replace(/\\(.)/g, '$1');

    // 4. Remove text between square brackets [and]
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '');

    // 5. Remove text between parentheses (and)
    cleaned = cleaned.replace(/\([^)]*\)/g, '');

    // 6. Remove Myanmar character
    cleaned = cleaned.replace(/။/g, '');

    // 7. Split multiple dialogues on the same line
    const lines = cleaned.split('\n');
    const cleanedLines: string[] = [];

    lines.forEach(line => {
        const strippedLine = line.trim();
        if (strippedLine.startsWith('-') && strippedLine.includes(' -')) {
            const dialogues = strippedLine.split(' -').map((d, i) => (i > 0 ? `-${d.trim()}` : d.trim()));
            cleanedLines.push(...dialogues);
        } else {
            cleanedLines.push(line);
        }
    });
    
    cleaned = cleanedLines.join('\n');
    
    // 8. Remove lines containing ONLY hyphens (with optional spaces)
    cleaned = cleaned.replace(/^[-\s]*$/gm, '');

    // Clean up multiple empty lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    return cleaned.trim();
};

export const getChangeSummary = (originalContent: string): ChangeSummary => {
    const cleanedContent = cleanSrtContent(originalContent);
    const foreignLanguages = detectForeignLanguages(originalContent);

    return {
        backslashesRemoved: (originalContent.match(/\\/g) || []).length,
        timestampsFixed: (originalContent.match(/--\\>/g) || []).length,
        htmlTagsFixed: (originalContent.match(/<[^>]+\\>/g) || []).length,
        bracketsRemoved: (originalContent.match(/\[[^\]]*\]/g) || []).length,
        parensRemoved: (originalContent.match(/\([^)]*\)/g) || []).length,
        hyphensRemoved: (originalContent.match(/^[-\s]*$/gm) || []).length,
        myanmarCharsRemoved: (originalContent.match(/။/g) || []).length,
        dialoguesSplit: (originalContent.match(/^.* -.*$/gm) || []).length,
        foreignLinesCount: Object.keys(foreignLanguages).length,
    };
};
