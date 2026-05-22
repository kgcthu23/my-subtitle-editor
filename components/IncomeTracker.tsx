import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Trash2, LineChart, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { IncomeData, IncomeEntry } from '../types';

export const IncomeTracker: React.FC = () => {
    const [lines, setLines] = useState('');
    const [rate, setRate] = useState('');
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
        if (isNaN(numLines) || isNaN(numRate)) return;

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
            amount: numLines * numRate 
        };
        
        updatedData[currentMonthKey].entries.unshift(entry);
        updatedData[currentMonthKey].total += entry.amount;

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
        setLines(''); 
        setRate('');
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
    };

    const currentMonthData = incomeData[currentMonthKey] ?? { total: 0, entries: [] };

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
        }, [] as { date: string, amount: number, lines: number }[]);

        return grouped;
    }, [currentMonthData.entries]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Add Entry Sidebar */}
            <div className="bg-zinc-950/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-900 flex flex-col gap-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-900">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-200">Log Translation</h3>
                        <p className="text-[11px] text-zinc-500">Record your subtitle lines completed.</p>
                    </div>
                </div>

                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Completed Lines</label>
                        <input 
                            type="number" 
                            value={lines} 
                            onChange={e => setLines(e.target.value)} 
                            className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm text-zinc-200 transition-all placeholder:text-zinc-700" 
                            placeholder="e.g. 1200" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Rate per Line (MMK)</label>
                        <input 
                            type="number" 
                            step="any"
                            value={rate} 
                            onChange={e => setRate(e.target.value)} 
                            className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm text-zinc-200 transition-all placeholder:text-zinc-700" 
                            placeholder="e.g. 1.5" 
                            required 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 flex justify-center items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Log Income
                    </button>
                </form>
            </div>

            {/* Dashboard Analytics */}
            <div className="lg:col-span-2 bg-zinc-950/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-900 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-zinc-900 gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <LineChart className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200">Income Overview</h3>
                            <p className="text-[11px] text-zinc-500">Translation work and payout statistics.</p>
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 px-4.5 py-2 rounded-xl border border-emerald-500/20 flex flex-col items-start sm:items-end shadow-[0_0_15px_rgba(16,185,129,0.02)]">
                        <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">Monthly Earnings</span>
                        <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mt-0.5">
                            {currentMonthData.total.toLocaleString()} MMK
                        </span>
                    </div>
                </div>

                {/* Analytical Chart */}
                {chartData.length > 0 ? (
                    <div className="h-60 w-full bg-zinc-950/40 rounded-xl border border-zinc-900/60 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: -5 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f293750" vertical={false} />
                                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#1f2937', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} MMK`, 'Payout']}
                                    labelStyle={{ color: '#9ca3af', marginBottom: '3px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : null}

                {/* Entries Listing */}
                <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Translation History</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1.5 custom-scrollbar">
                        {currentMonthData.entries.map(entry => (
                            <div 
                                key={entry.id} 
                                className="flex justify-between items-center p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-900/60 group hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all"
                            >
                                <div className="text-left">
                                    <p className="text-xs font-bold text-zinc-200">{entry.lines.toLocaleString()} lines</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">{entry.date} &middot; {entry.rate} MMK/line</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-bold text-emerald-400">{entry.amount.toLocaleString()} MMK</p>
                                    <button
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="text-zinc-600 hover:text-rose-400 transition-colors p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-lg cursor-pointer"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {currentMonthData.entries.length === 0 && (
                            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-900 bg-zinc-950/20">
                                <p className="text-zinc-500 text-xs font-medium">No payouts logged for this month.</p>
                                <p className="text-[10px] text-zinc-600 mt-1">Submit completed lines in the sidebar to log earnings.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
