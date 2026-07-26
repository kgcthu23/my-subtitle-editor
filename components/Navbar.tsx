import React from 'react';
import { Sparkles, LayoutDashboard, Calculator, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export type AppView = 'cleaner' | 'tracker';

interface NavbarProps {
    activeView: AppView;
    setActiveView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        {
            id: 'cleaner' as AppView,
            label: 'Subtitle Cleaner',
            subLabel: 'Auto-formatting & Repair',
            icon: LayoutDashboard,
            badge: 'v2.5'
        },
        {
            id: 'tracker' as AppView,
            label: 'Income Tracker',
            subLabel: 'Rates & Analytics',
            icon: Calculator,
            badge: null
        }
    ];

    return (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#030712]/80 border-b border-zinc-800/80 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo & Tag */}
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => setActiveView('cleaner')}>
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
                            <div className="relative w-11 h-11 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center shadow-2xl">
                                <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                                    MyanSub Cleaner
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Toolkit
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 hidden sm:block font-medium">
                                Subtitle refinement, Burmese script cleanup & translator income management
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex items-center gap-1.5 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-2xl">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id)}
                                    className={cn(
                                        "relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 cursor-pointer select-none",
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/40"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-transform", isActive ? "scale-110 text-white" : "text-zinc-400")} />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase",
                                            isActive ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
};
