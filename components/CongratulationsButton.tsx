import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

export const CongratulationsButton: React.FC = () => {
    const [isCongratsOpen, setIsCongratsOpen] = useState(false);
    const [isHighlightOpen, setIsHighlightOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        const savedCount = localStorage.getItem('congratsButtonClickCount');
        if (savedCount) {
            setClickCount(parseInt(savedCount, 10));
        }

        const hasSeen = localStorage.getItem('congratsButtonSeen');
        if (!hasSeen) {
            setIsHighlightOpen(true);
        }
    }, []);

    const triggerFireworks = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        localStorage.setItem('congratsButtonClickCount', newCount.toString());

        if (isHighlightOpen) {
            setIsHighlightOpen(false);
            localStorage.setItem('congratsButtonSeen', 'true');
        }
        setIsCongratsOpen(true);

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "d6be84f4-63ed-4347-b06c-fe7048ffa2ac",
                subject: "Congratulations Button Clicked!",
                name: "Secret Notification",
                message: "The 'Click here!' button was clicked in Translator's Toolkit! 🎉",
            }),
        }).catch(() => { });

        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#f472b6', '#818cf8', '#34d399']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#f472b6', '#818cf8', '#34d399']
            });
        }, 250);
    };

    return (
        <>
            <AnimatePresence>
                {isHighlightOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="absolute bottom-24 left-6 lg:left-10 lg:bottom-28 animate-bounce text-pink-400 font-bold text-lg flex flex-col items-center">
                            <span className="mb-2">Click me!</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {clickCount < 1 && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerFireworks}
                    className={`fixed bottom-6 left-6 lg:bottom-10 lg:left-10 ${isHighlightOpen ? 'z-[65] shadow-[0_0_50px_rgba(244,114,182,1)] animate-pulse' : 'z-[50] shadow-[0_0_20px_rgba(244,114,182,0.4)] hover:shadow-[0_0_30px_rgba(244,114,182,0.6)]'} bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-6 py-3.5 rounded-full font-bold border border-pink-400/50 flex items-center gap-3 transition-all group cursor-pointer`}
                >
                    <span className="text-xl">Click here!</span>
                </motion.button>
            )}

            <AnimatePresence>
                {isCongratsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsCongratsOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="bg-zinc-900 border-2 border-pink-500/50 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full relative flex flex-col items-center text-center overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-pink-500/20 blur-[50px] rounded-full"></div>
                            <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-indigo-500/20 blur-[50px] rounded-full"></div>

                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="bg-pink-500/10 p-4 rounded-full border border-pink-500/30 mb-6"
                            >
                                <Star className="w-16 h-16 text-pink-400" />
                            </motion.div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-indigo-400 mb-6 drop-shadow-sm leading-tight">
                                Great Job! စမရ-၇၁၄
                            </h2>

                            <p className="text-xl text-zinc-300 font-medium mb-8 leading-relaxed">
                                u totally crushed the exam! <br />
                                u tried hard and i believe ur hard work will pay off <br />
                                accept canva mail from gmail app and let me know if it's working or not<br />
                                <a target="_blank" className="font-bold text-amber-300" href="https://drive.google.com/file/d/1vrfL6M50kJ84BeNSQjx8s_sSf7hK1SR0/view?usp=sharing">click here to see if it's working or not</a>
                            </p>

                            <button
                                onClick={() => setIsCongratsOpen(false)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)] transform hover:-translate-y-1"
                            >
                                Yay! 🎉
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
