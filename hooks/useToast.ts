import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export const toast = {
    success: (message: string) => window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type: 'success' } })),
    error: (message: string) => window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type: 'error' } })),
    info: (message: string) => window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type: 'info' } })),
};

export function useToastSystem() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handleToast = (e: Event) => {
            const customEvent = e as CustomEvent;
            const newToast: ToastMessage = {
                id: crypto.randomUUID(),
                message: customEvent.detail.message,
                type: customEvent.detail.type,
            };
            setToasts(prev => [...prev, newToast]);

            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 3000);
        };

        window.addEventListener('app-toast', handleToast);
        return () => window.removeEventListener('app-toast', handleToast);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, removeToast };
}
