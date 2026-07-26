import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Trash2, LineChart, Plus, Download, DollarSign, Calendar, Layers, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { IncomeData, IncomeEntry } from '../types';
import { toast } from '../hooks/useToast';

export const IncomeTracker: React.FC = () => {
    const [lines, setLines] = useState('');
    const [rate, setRate] = useState(() => localStorage.getItem('defaultIncomeRate') || '');
    const [note, setNote] = useState('');
    const [saveDefaultRate, setSaveDefaultRate] = useState(true);
    const [incomeData, setIncomeData] = useState<IncomeData>({});

    useEffect(() => {
        const savedData = localStorage.getItem('incomeTrackerData');
        if (savedData) {
            try { 
                setIncomeData(JSON.parse(savedData)); 
            } catch (e) {
                console.error("Failed to load income tracker data:", e);
            }
        }
    }, []);

    const currentMonthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }, []);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const numLines = parseInt(lines, 10);
        const numRate = parseFloat(rate);
        if (isNaN(numLines) || numLines <= 0) {
            toast.error('Please enter a valid line count.');
            return;
        }
        if (isNaN(numRate) || numRate <= 0) {
            toast.error('Please enter a valid MMK rate.');
            return;
        }

        const updatedData = JSON.parse(JSON.stringify(incomeData));
        if (!updatedData[currentMonthKey]) {
            updatedData[currentMonthKey] = { total: 0, entries: [] };
        }

        const entry: IncomeEntry = { 
            id: crypto.randomUUID(), 
            date: new Date().toISOString().split('T')[0], 
            timestamp: new Date().toISOString(), 
            lines: numLines, 
            rate: numRate, 
            amount: numLines * numRate,
            note: note.trim() || undefined
        };
        
        updatedData[currentMonthKey].entries.unshift(entry);
        updatedData[currentMonthKey].total += entry.amount;

        if (saveDefaultRate) {
            localStorage.setItem('defaultIncomeRate', rate);
        }

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
        setLines(''); 
        setNote('');
        toast.success(`Logged ${numLines.toLocaleString()} lines (${entry.amount.toLocaleString()} MMK) successfully!`);
    };

    const handleDeleteEntry = (id: string) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;
        
        const updatedData = JSON.parse(JSON.stringify(incomeData));
        const monthData = updatedData[currentMonthKey];
        if (!monthData) return;

        const entryIndex = monthData.entries.findIndex((e: IncomeEntry) => e.id === id);
        if (entryIndex === -1) return;

        const entry = monthData.entries[entryIndex];
        monthData.total -= entry.amount;
        monthData.entries.splice(entryIndex, 1);

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
        toast.info('Translation entry removed.');
    };

    const exportToCSV = () => {
        const allEntries: (IncomeEntry & { month: string })[] = [];
        Object.entries(incomeData).forEach(([month, data]) => {
            data.entries.forEach(entry => {
                allEntries.push({ ...entry, month });
            });
        });

        if (allEntries.length === 0) {
            toast.error('No income entries to export.');
            return;
        }

        const headers = ['Date', 'Month', 'Lines Completed', 'Rate (MMK)', 'Total Amount (MMK)', 'Notes'];
        const rows = allEntries.map(e => [
            e.date,
            e.month,
            e.lines,
            e.rate,
            e.amount,
            `"${(e.note || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `translator_income_report_${currentMonthKey}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Income report exported as CSV!');
    };

    const currentMonthData = incomeData[currentMonthKey] ?? { total: 0, entries: [] };

    const totalLinesThisMonth = useMemo(() => {
        return currentMonthData.entries.reduce((sum, e) => sum + e.lines, 0);
    }, [currentMonthData.entries]);

    const allTimeTotal = useMemo(() => {
        return Object.values(incomeData).reduce((sum, month: any) => sum + month.total, 0);
    }, [incomeData]);

    const avgDailyEarnings = useMemo(() => {
        if (!currentMonthData || currentMonthData.entries.length === 0) return 0;
        const uniqueDays = new Set(currentMonthData.entries.map((e: IncomeEntry) => e.date)).size;
        return currentMonthData.total / uniqueDays;
    }, [currentMonthData]);

    const chartData = useMemo(() => {
        const sorted = [...currentMonthData.entries].reverse();
        
        const grouped = sorted.reduce((acc, entry) => {
            const existing = acc.find(e => e.date === entry.date);
            if (existing) {
                existing.amount += entry.amount;
                existing.lines += entry.lines;
            } else {
                acc.push({ 
                    date: entry.date.split('-').slice(1).join('/'), 
                    amount: entry.amount, 
                    lines: entry.lines 
                });
            }
            return acc;
        }, [] as { date: string; amount: number; lines: number }[]);

        return grouped;
    }, [currentMonthData.entries]);

    return (
        <div className="space-y-6">
            {/* Top Bar with Export Action */}
            <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-indigo-400" /> Translator Income & Rate Tracker
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Log subtitle lines completed, track per-line rates in MMK, and view financial stats.
                    </p>
                </div>

                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export CSV Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Log Entry Sidebar */}
                <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/90 flex flex-col gap-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-900">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Log Translation Work</h3>
                            <p className="text-[11px] text-zinc-400">Record completed subtitle lines.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddEntry} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Subtitle Lines Completed
                            </label>
                            <input 
                                type="number" 
                                value={lines} 
                                onChange={e => setLines(e.target.value)} 
                                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm text-zinc-100 transition-all placeholder:text-zinc-700 font-mono" 
                                placeholder="e.g. 1500" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Rate per Line (MMK)
                            </label>
                            <input 
                                type="number" 
                                step="any"
                                value={rate} 
                                onChange={e => setRate(e.target.value)} 
                                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm text-zinc-100 transition-all placeholder:text-zinc-700 font-mono" 
                                placeholder="e.g. 1.5" 
                                required 
                            />
                            <div className="mt-2 flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="saveDefault"
                                    checked={saveDefaultRate}
                                    onChange={e => setSaveDefaultRate(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-800 text-indigo-500 focus:ring-indigo-500/30 accent-indigo-500"
                                />
                                <label htmlFor="saveDefault" className="text-[11px] text-zinc-400 select-none cursor-pointer">
                                    Save as default rate for future entries
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Project / Episode Note (Optional)
                            </label>
                            <input 
                                type="text" 
                                value={note} 
                                onChange={e => setNote(e.target.value)} 
                                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm text-zinc-100 transition-all placeholder:text-zinc-700" 
                                placeholder="e.g. Kdrama Ep 04" 
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all flex justify-center items-center gap-2 cursor-pointer"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Log Income Entry
                        </button>
                    </form>
                </div>

                {/* Dashboard Analytics & Listing */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stat Widgets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-emerald-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Monthly Payout</span>
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-xl font-extrabold text-white mt-2 font-mono">
                                {currentMonthData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-emerald-400 font-sans">MMK</span>
                            </p>
                        </div>

                        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-blue-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Daily Average</span>
                                <Calendar className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-xl font-extrabold text-white mt-2 font-mono">
                                {avgDailyEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-blue-400 font-sans">MMK</span>
                            </p>
                        </div>

                        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-indigo-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Monthly Lines</span>
                                <Layers className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-xl font-extrabold text-white mt-2 font-mono">
                                {totalLinesThisMonth.toLocaleString()} <span className="text-xs text-indigo-400 font-sans">lines</span>
                            </p>
                        </div>

                        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/90 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-purple-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">All-Time Total</span>
                                <LineChart className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-xl font-extrabold text-white mt-2 font-mono">
                                {allTimeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-purple-400 font-sans">MMK</span>
                            </p>
                        </div>
                    </div>

                    {/* Chart Container */}
                    {chartData.length > 0 && (
                        <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800/90 shadow-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                    <LineChart className="w-4 h-4 text-emerald-400" /> Daily Earnings Visualizer ({currentMonthKey})
                                </h3>
                            </div>
                            <div className="h-56 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f293780" vertical={false} />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                                            formatter={(value: number) => [`${value.toLocaleString()} MMK`, 'Payout']}
                                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Work Entries History */}
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                Subtitle Work History ({currentMonthData.entries.length} entries)
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-mono">Current Month: {currentMonthKey}</span>
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                            {currentMonthData.entries.map(entry => (
                                <div 
                                    key={entry.id} 
                                    className="flex justify-between items-center p-4 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl border border-zinc-800/80 transition-all group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white font-mono">{entry.lines.toLocaleString()} lines</p>
                                            {entry.note && (
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-semibold">
                                                    {entry.note}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                                            {entry.date} &middot; {entry.rate} MMK/line
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-bold text-emerald-400 font-mono">{entry.amount.toLocaleString()} MMK</p>
                                        <button
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="text-zinc-500 hover:text-rose-400 transition-colors p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
                                            title="Delete entry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {currentMonthData.entries.length === 0 && (
                                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
                                    <p className="text-zinc-400 text-xs font-medium">No payouts logged for {currentMonthKey} yet.</p>
                                    <p className="text-[11px] text-zinc-500 mt-1">Use the form on the left to record completed lines.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
