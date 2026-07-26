import type { ForeignLanguageReport, ChangeSummary, CleanerOptions } from '../types';
import { DEFAULT_CLEANER_OPTIONS } from '../types';

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

const fixSrtFormat = (content: string): { fixedContent: string; count: number } => {
    const lines = content.split('\n');
    const formattedLines: string[] = [];
    let fixesCount = 0;
    
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        
        const ensureBlockSeparator = () => {
             if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
                 formattedLines.push('');
             }
        };

        // Case 1: number, timestamp, and text are on the same line (Merged Line)
        const fullMatch = line.match(/^(\d+)\s+((?:\d{2}:){2}\d{2},\d{3}\s*-->\s*(?:\d{2}:){2}\d{2},\d{3})\s*(.*)$/);
        if (fullMatch) {
            ensureBlockSeparator();
            fixesCount++;
            const [, num, timestamp, text] = fullMatch;
            formattedLines.push(num, timestamp.trim());
            if (text.trim()) formattedLines.push(text.trim());
            i++;
            continue;
        }

        // Case 2: line is a number, and the next line contains timestamp
        if (line.match(/^\d+$/) && i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            const tsMatch = nextLine.match(/^((?:\d{2}:){2}\d{2},\d{3}\s*-->\s*(?:\d{2}:){2}\d{2},\d{3})\s*(.*)$/);
            if(tsMatch) {
                ensureBlockSeparator();
                
                const [, timestamp, text] = tsMatch;
                
                if (text.trim()) {
                    fixesCount++;
                    formattedLines.push(line, timestamp.trim(), text.trim());
                } else {
                    formattedLines.push(line, timestamp.trim());
                }

                i += 2;
                continue;
            }
        }
        
        formattedLines.push(line);
        i++;
    }
    
    const fixedContent = formattedLines.join('\n').replace(/(\r\n|\n|\r){3,}/g, '\n\n').trim();
    return { fixedContent, count: fixesCount };
};

export const cleanSrtContent = (content: string, options: CleanerOptions = DEFAULT_CLEANER_OPTIONS): string => {
    let cleaned = content;

    // 1. Fix major SRT format issues
    if (options.fixTimestamps) {
        const { fixedContent } = fixSrtFormat(cleaned);
        cleaned = fixedContent;
    }
    
    // 2. Remove backslashes from timestamps and HTML tags
    if (options.removeBackslashes) {
        cleaned = cleaned.replace(/--\\>/g, '-->');
        cleaned = cleaned.replace(/<([^>]+)\\>/g, '<$1>');
        cleaned = cleaned.replace(/\\(.)/g, '$1');
    }

    // 3. Remove text between square brackets and parentheses
    if (options.stripBrackets) {
        cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
    }
    if (options.stripParens) {
        cleaned = cleaned.replace(/\([^)]*\)/g, '');
    }

    // 4. Remove Myanmar punctuation characters (|| ။ and | ၊)
    if (options.removeMyanmarSpecialChars) {
        cleaned = cleaned.replace(/[။၊]/g, '');
    }

    // 4.5 Remove Exclamation marks (!) and Question marks (?)
    if (options.removeExclamationAndQuestion) {
        cleaned = cleaned.replace(/[!?！？]/g, '');
    }

    // 5. Remove speaker labels
    if (options.removeSpeakerLabels) {
        const speakerCleanedLines = cleaned.split('\n').map(line => {
            if (/^\d+$/.test(line.trim()) || /-->/.test(line.trim())) {
                return line;
            }
            let cleanedLine = line;
            cleanedLine = cleanedLine.replace(/^(ကြေညာသူ|စကားပြောသူ|အသံ|ဇာတ်ဆောင်)\s*[၀-၉]*\s*:\s*/, '');
            cleanedLine = cleanedLine.replace(/^(Speaker\s*\d+|Narrator|Actor\s*\d+|Voice\s*\d+|Man|Woman|Boy|Girl):\s*/i, '');
            cleanedLine = cleanedLine.replace(/^(?!.*\s-->\s)[^:\n]{1,30}:\s?/, '');
            return cleanedLine;
        });
        cleaned = speakerCleanedLines.join('\n');
    }

    // 6. Split multiple dialogues on the same line
    if (options.splitDialogues) {
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
    }
    
    // 6.5 Remove untranslated English lines
    if (options.removeUntranslatedEnglish) {
        const noEnglishLines = cleaned.split('\n').filter(line => {
            if (/^\d+$/.test(line.trim()) || /-->/.test(line.trim())) {
                return true;
            }
            const hasEnglish = /[a-zA-Z]/.test(line);
            const hasMyanmar = /[\u1000-\u109F]/.test(line);
            if (hasEnglish && !hasMyanmar) {
                return false;
            }
            return true;
        });
        cleaned = noEnglishLines.join('\n');
    }

    // 7. Remove lines containing ONLY hyphens
    if (options.removeEmptyHyphens) {
        cleaned = cleaned.replace(/^[-\s]*$/gm, '');
    }

    // 7.5. Safety: Remove empty lines immediately following a timestamp
    const lines = cleaned.split('\n');
    const compactLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const prevLine = i > 0 ? lines[i-1] : '';
        
        if (!currentLine.trim()) {
            if (prevLine.includes('-->')) {
                continue;
            }
        }
        compactLines.push(currentLine);
    }
    cleaned = compactLines.join('\n');

    // 8. Final cleanup of multiple empty lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    return cleaned.trim();
};

export const getChangeSummary = (originalContent: string, options: CleanerOptions = DEFAULT_CLEANER_OPTIONS): ChangeSummary => {
    const cleanedContent = cleanSrtContent(originalContent, options);
    const foreignLanguages = detectForeignLanguages(cleanedContent);
    
    const { count: formatFixesCount } = fixSrtFormat(originalContent);
    
    const burmeseSpeakerPattern = /^(ကြေညာသူ|စကားပြောသူ|အသံ|ဇာတ်ဆောင်)\s*[၀-၉]*\s*:\s*/gm;
    const englishSpeakerPattern = /^(Speaker\s*\d+|Narrator|Actor\s*\d+|Voice\s*\d+|Man|Woman|Boy|Girl):\s*/gim;
    const genericSpeakerPattern = /^(?!.*\s-->\s)[^:\n]{1,30}:\s?/gm;

    const burmeseMatches = (originalContent.match(burmeseSpeakerPattern) || []).length;
    const englishMatches = (originalContent.match(englishSpeakerPattern) || []).length;
    
    let tempContent = originalContent.replace(burmeseSpeakerPattern, '').replace(englishSpeakerPattern, '');
    const genericMatches = (tempContent.match(genericSpeakerPattern) || []).length;

    const speakerLabelsRemoved = burmeseMatches + englishMatches + genericMatches;

    const englishLinesRemoved = originalContent.split('\n').filter(line => {
        if (/^\d+$/.test(line.trim()) || /-->/.test(line.trim())) return false;
        const hasEnglish = /[a-zA-Z]/.test(line);
        const hasMyanmar = /[\u1000-\u109F]/.test(line);
        return hasEnglish && !hasMyanmar;
    }).length;

    return {
        formatFixes: formatFixesCount,
        backslashesRemoved: (originalContent.match(/\\/g) || []).length,
        timestampsFixed: (originalContent.match(/--\\>/g) || []).length,
        htmlTagsFixed: (originalContent.match(/<[^>]+\\>/g) || []).length,
        bracketsRemoved: (originalContent.match(/\[[^\]]*\]/g) || []).length,
        parensRemoved: (originalContent.match(/\([^)]*\)/g) || []).length,
        speakerLabelsRemoved,
        hyphensRemoved: (originalContent.match(/^[-\s]*$/gm) || []).length,
        myanmarCharsRemoved: (originalContent.match(/[။၊]/g) || []).length,
        exclamationAndQuestionsRemoved: (originalContent.match(/[!?！？]/g) || []).length,
        dialoguesSplit: (originalContent.match(/^.* -.*$/gm) || []).length,
        englishLinesRemoved,
        foreignLinesCount: Object.keys(foreignLanguages).length,
    };
};

export const SAMPLE_SRT_CONTENT = `1
00:00:01,200 --\> 00:00:04,500
Speaker 1: မင်္ဂလာပါ ခင်ဗျာ! [Laughs] ဒီနေ့တော့ Subtitle Cleaner ကို စမ်းသပ်ကြည့်ကြမလား?

2 00:00:05,100 --\> 00:00:08,300 (Door opens loudly)
စကားပြောသူ ၁: ကျွန်တော်တို့ Subtitle တွေကို၊ သန့်ရှင်းအောင် ပြုလုပ်ပေးပါတယ်။

3
00:00:09,000 --> 00:00:12,400
This is an untranslated English subtitle line that should be filtered out!

4
00:00:13,100 --> 00:00:16,800
- နေကောင်းလား ခင်ဗျာ? - နေကောင်းပါတယ် ခင်ဗျာ!

5
00:00:17,200 --> 00:00:20,000
-

6
00:00:20,500 --> 00:00:24,100
<b><i>အထူးကျေးဇူးတင်ရှိပါသည်၊</i>\></b> ကျွန်တော်တို့ရဲ့ Toolkit ကို အသုံးပြုပေးတဲ့အတွက် ဝမ်းသာပါတယ်!

7
00:00:25,000 --> 00:00:28,500
สวัสดีครับ (Thai greeting line test) ဤသည်မှာ ပုံမှန်စာကြောင်းဖြစ်ပါသည်။`;