import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastSystem, ToastType } from '../hooks/useToast';
import { cn } from '../lib/utils';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastSystem();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                            "bg-zinc-950/90 backdrop-blur-xl border shadow-xl rounded-xl p-4 flex items-center gap-3 pointer-events-auto min-w-[250px]",
                            toast.type === 'success' ? "border-emerald-500/20" : 
                            toast.type === 'error' ? "border-rose-500/20" : 
                            "border-indigo-500/20"
                        )}
                    >
                        {icons[toast.type]}
                        <span className="text-sm text-zinc-200 font-medium flex-1">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="text-zinc-500 hover:text-zinc-300">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
