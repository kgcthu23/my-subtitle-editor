import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Trash2, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { IncomeData, IncomeEntry } from '../types';

export const IncomeTracker: React.FC = () => {
    const [lines, setLines] = useState('');
    const [rate, setRate] = useState('');
    const [incomeData, setIncomeData] = useState<IncomeData>({});

    useEffect(() => {
        const savedData = localStorage.getItem('incomeTrackerData');
        if (savedData) try { setIncomeData(JSON.parse(savedData)); } catch (e) { }
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
        if (!updatedData[currentMonthKey]) updatedData[currentMonthKey] = { total: 0, entries: [] };

        const entry: IncomeEntry = { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), lines: numLines, rate: numRate, amount: numLines * numRate };
        updatedData[currentMonthKey].entries.unshift(entry);
        updatedData[currentMonthKey].total += entry.amount;

        setIncomeData(updatedData);
        localStorage.setItem('incomeTrackerData', JSON.stringify(updatedData));
        setLines(''); setRate('');
    };

    const handleDeleteEntry = (id: string) => {
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
        // Reverse entries to show chronological order
        const sorted = [...currentMonthData.entries].reverse();
        
        // Group by date if there are multiple entries on the same day
        const grouped = sorted.reduce((acc, entry) => {
            const existing = acc.find(e => e.date === entry.date);
            if (existing) {
                existing.amount += entry.amount;
                existing.lines += entry.lines;
            } else {
                acc.push({ date: entry.date.split('-').slice(1).join('/'), amount: entry.amount, lines: entry.lines });
            }
            return acc;
        }, [] as { date: string, amount: number, lines: number }[]);

        return grouped;
    }, [currentMonthData.entries]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-zinc-800/50">
                <h3 className="text-lg font-bold mb-4 text-zinc-100 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-400" /> Add Entry</h3>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Lines</label>
                        <input type="number" value={lines} onChange={e => setLines(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 transition-all placeholder:text-zinc-600" placeholder="1000" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Rate (MMK)</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 transition-all placeholder:text-zinc-600" placeholder="1.5" required />
                    </div>
                    <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2">Add Income</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-zinc-800/80 gap-4">
                    <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2"><LineChart className="w-5 h-5 text-emerald-400" /> Dashboard</h3>
                    <div className="bg-emerald-500/10 px-5 py-3 rounded-xl border border-emerald-500/20 flex flex-col items-end sm:items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-1">This Month's Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{currentMonthData.total.toLocaleString()} MMK</span>
                    </div>
                </div>

                {chartData.length > 0 && (
                    <div className="mb-8 h-64 w-full bg-zinc-950/30 rounded-xl border border-zinc-800/50 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.5rem', fontSize: '13px' }}
                                    itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} MMK`, 'Earned']}
                                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Recent Entries</h4>
                <div className="space-y-3">
                    {currentMonthData.entries.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center p-4 bg-zinc-950/50 rounded-xl group hover:bg-zinc-800/80 transition-all border border-transparent hover:border-zinc-700/50">
                            <div>
                                <p className="font-bold text-zinc-200">{entry.lines.toLocaleString()} lines</p>
                                <p className="text-xs text-zinc-500 mt-1">{entry.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="font-bold text-emerald-400">{entry.amount.toLocaleString()} MMK</p>
                                <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-zinc-500 hover:text-rose-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg"
                                    title="Delete entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {currentMonthData.entries.length === 0 && (
                        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30">
                            <p className="text-zinc-500 font-medium">No entries this month.</p>
                            <p className="text-xs text-zinc-600 mt-2">Start typing lines above to track your income!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
