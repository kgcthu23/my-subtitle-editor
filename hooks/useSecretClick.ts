import React, { useState, useEffect } from 'react';

export function useSecretClick(onUnlock?: () => void) {
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
            
            if (onUnlock) {
                onUnlock();
            }



            window.open('https://drive.google.com/drive/u/0/folders/16j0H2tw4-xbK2Vb9VAzqzmZa9Edxprju', '_blank');
        } else {
            setSecretClickCount(newCount);
        }
    };

    return { loveEffects, handleSecretClick };
}
