import React, { useState, useEffect } from 'react';

export function useSecretClick() {
    const [secretClickCount, setSecretClickCount] = useState<number>(0);
    const [loveEffects, setLoveEffects] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        if (loveEffects.length > 0) {
            const timer = setTimeout(() => setLoveEffects(prev => prev.slice(1)), 1000);
            return () => clearTimeout(timer);
        }
    }, [loveEffects]);

    const handleSecretClick = (e: React.MouseEvent) => {
        const newCount = secretClickCount + 1;
        setLoveEffects(prev => [...prev, { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY }]);

        if (newCount >= 4) {
            setSecretClickCount(0);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: "d6be84f4-63ed-4347-b06c-fe7048ffa2ac",
                    subject: "Secret Link Accessed!",
                    name: "Secret Notification",
                    message: "Thu Zue Zue San was clicked 4 times and the secret drive link was opened! 💖",
                }),
            }).catch(() => { });

            window.open('https://drive.google.com/drive/u/0/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju', '_blank');
        } else {
            setSecretClickCount(newCount);
        }
    };

    return { loveEffects, handleSecretClick };
}
