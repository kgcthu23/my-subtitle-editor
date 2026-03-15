import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export const DopamineDispenser: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [randomImageSessionCount, setRandomImageSessionCount] = useState(0);

    const [githubFolders, setGithubFolders] = useState<Record<string, string[]>>({});

    const fetchGithubFolder = async (folder: string): Promise<string[]> => {
        if (githubFolders[folder]) return githubFolders[folder];

        try {
            const cacheBuster = `?t=${new Date().getTime()}`;
            const res = await fetch(`https://api.github.com/repos/kgcthu23/random-images/contents/${encodeURIComponent(folder)}${cacheBuster}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const urls = data.filter((item: any) => item.type === 'file').map((item: any) => item.download_url);
                setGithubFolders(prev => ({ ...prev, [folder]: urls }));
                return urls;
            }
        } catch (e) {
            console.error(`Failed to fetch ${folder} from GitHub:`, e);
        }
        return [];
    };

    const getRandomGithubImage = async (folder: string): Promise<string | null> => {
        const urls = await fetchGithubFolder(folder);
        if (urls.length > 0) {
            return urls[Math.floor(Math.random() * urls.length)];
        }
        return null;
    };

    const fetchDopamine = async (isFirstOpen: boolean = false, userClickCount: number = 0) => {
        setIsLoading(true);
        setImageUrl(null);

        const todayStr = new Date().toLocaleDateString();
        const lastOpenDate = localStorage.getItem('dopamineLastOpenDate');

        try {
            if (isFirstOpen && lastOpenDate !== todayStr) {
                const url = await getRandomGithubImage('good morning');
                if (url) {
                    setImageUrl(url);
                    localStorage.setItem('dopamineLastOpenDate', todayStr);
                    return;
                }
            }

            if (isFirstOpen) {
                localStorage.setItem('dopamineLastOpenDate', todayStr);
            }

            if (!isFirstOpen && userClickCount === 3) {
                const url = await getRandomGithubImage('motivation');
                if (url) {
                    setImageUrl(url);
                    return;
                }
            }

            if (randomImageSessionCount < 10) {
                const url = await getRandomGithubImage('random');
                if (url) {
                    setRandomImageSessionCount(prev => prev + 1);
                    setImageUrl(url);
                    return;
                }
            }

            const sources = ['cat', 'dog', 'github_random'];
            const source = sources[Math.floor(Math.random() * sources.length)];

            if (source === 'github_random') {
                const url = await getRandomGithubImage('random');
                if (url) {
                    setImageUrl(url);
                    return;
                }
            }

            const isCat = Math.random() > 0.5;
            if (isCat) {
                const res = await fetch('https://api.thecatapi.com/v1/images/search');
                const data = await res.json();
                setImageUrl(data[0].url);
            } else {
                const res = await fetch('https://dog.ceo/api/breeds/image/random');
                const data = await res.json();
                setImageUrl(data.message);
            }
        } catch (e) {
            console.error(e);
            setImageUrl('https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMorePlease = () => {
        const nextCount = clickCount + 1;
        setClickCount(nextCount);
        fetchDopamine(false, nextCount);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setClickCount(0);
        setRandomImageSessionCount(0);
        fetchDopamine(true, 0);

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "d6be84f4-63ed-4347-b06c-fe7048ffa2ac",
                subject: "Serotonin Button Pressed!",
                name: "Secret Notification",
                message: "The serotonin button was just pressed directly! 🐾",
            }),
        }).catch(() => { });
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[60] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-6 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] border border-amber-400/50 flex items-center gap-3 transition-all hover:scale-110 active:scale-95 group"
            >
                <span className="text-xl group-hover:animate-bounce">🐾</span>
                <span>Get Dopamine</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-sm w-full relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-950 rounded-full p-1 border border-zinc-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-5 flex items-center gap-2">
                            Instant Serotonin
                        </h3>

                        <div className="w-full aspect-square bg-black/50 rounded-xl overflow-hidden flex items-center justify-center mb-5 relative border border-zinc-800/80 shadow-inner">
                            {isLoading && (
                                <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {imageUrl && !isLoading && (
                                <img src={imageUrl} alt="Cute animal" className="w-full h-full object-cover animate-fade-in" />
                            )}
                        </div>

                        <button onClick={handleMorePlease} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-colors border border-zinc-700/50 flex justify-center items-center gap-2 hover:border-zinc-500/50">
                            <span>More please</span>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
