import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Maximize, Minimize, Hand, Undo, Redo } from 'lucide-react';

interface SharedCanvasProps {
    canvasData: string | undefined;
    onSave: (dataUrl: string) => void;
    disabled?: boolean;
    fillParent?: boolean;
}

export function SharedCanvas({ canvasData, onSave, disabled, fillParent }: SharedCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);

    const colors = ['#ffffff', '#ef4444', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

    // Load initial data
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvasData) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height);
            };
            img.src = canvasData;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [canvasData]);

    // Handle Escape key for exiting fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (isPanning) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Save state to history before starting a new stroke
        setHistory(prev => {
            const newHistory = [...prev, canvas.toDataURL('image/png')];
            return newHistory.slice(-50); // Keep last 50 states
        });
        setRedoHistory([]); // Clear redo history on new action
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Since canvas display size equals internal size when style width/height match width/height attrs
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.beginPath();
        ctx.moveTo(x * scaleX, y * scaleY);
        draw(e);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            // Wait a brief moment to save the updated canvas
            setTimeout(() => {
                 onSave(canvas.toDataURL('image/png'));
            }, 100);
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const previousState = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setRedoHistory(prev => [...prev, canvas.toDataURL('image/png')]);
        
        restoreCanvas(previousState);
    };

    const handleRedo = () => {
        if (redoHistory.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const nextState = redoHistory[redoHistory.length - 1];
        setRedoHistory(prev => prev.slice(0, -1));
        setHistory(prev => [...prev, canvas.toDataURL('image/png')]);
        
        restoreCanvas(nextState);
    };

    const restoreCanvas = (dataUrl: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height);
                onSave(canvas.toDataURL('image/png'));
            };
            img.src = dataUrl;
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || isPanning) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.lineWidth = isEraser ? 20 : brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isEraser ? '#09090b' : color; 
        ctx.globalCompositeOperation = "source-over";

        ctx.lineTo(x * scaleX, y * scaleY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x * scaleX, y * scaleY);
    };

    return (
        <div className={isFullscreen ? "fixed inset-0 z-[100] bg-zinc-950 flex flex-col w-full h-full" : (fillParent ? "flex-1 flex flex-col min-h-0 w-full" : "flex flex-col gap-4")}>
            <div className={`z-10 transition-all duration-300 ${
                isFullscreen 
                ? "absolute top-0 left-0 right-0 pt-6 pb-12 flex justify-center opacity-0 hover:opacity-100 focus-within:opacity-100" 
                : "w-full"
            }`}>
                <div className={isFullscreen
                    ? "flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-2xl"
                    : "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 w-full"
                }>
                    <button
                        onClick={() => { setIsPanning(true); setIsEraser(false); }}
                        className={`min-w-8 h-8 px-2 shrink-0 rounded flex items-center justify-center transition-all border-2 ${isPanning ? 'bg-zinc-700 border-white scale-110' : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                        title="Pan / Swipe Tool"
                    >
                        <Hand className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-zinc-700 mx-2 shrink-0" />
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setIsEraser(false); setIsPanning(false); }}
                            className={`w-8 h-8 rounded-full border-2 shrink-0 transition-transform ${color === c && !isEraser && !isPanning ? 'scale-110 border-white' : 'border-transparent scale-100'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                        />
                    ))}
                    <div className="w-px h-6 bg-zinc-700 mx-2 shrink-0" />
                    <button
                        onClick={() => { setIsEraser(true); setIsPanning(false); }}
                        className={`min-w-8 h-8 px-2 shrink-0 rounded flex items-center justify-center transition-all border-2 ${isEraser ? 'bg-zinc-700 border-white scale-110' : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                        title="Eraser"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-zinc-700 mx-2 shrink-0" />
                    
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className="min-w-8 h-8 px-2 shrink-0 rounded text-zinc-400 flex items-center justify-center transition-all bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={redoHistory.length === 0}
                        className="min-w-8 h-8 px-2 shrink-0 rounded text-zinc-400 flex items-center justify-center transition-all bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-zinc-700 mx-2 shrink-0" />

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className={`min-w-8 h-8 px-2 shrink-0 rounded text-zinc-400 flex items-center justify-center transition-all bg-zinc-800 hover:text-white`}
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <div className={`relative w-full ${isFullscreen ? 'flex-1 h-full' : (fillParent ? 'flex-1 min-h-0 h-full' : 'h-[500px]')} ${isFullscreen ? 'bg-zinc-950' : 'bg-zinc-950/50 rounded-xl border border-zinc-800/50'} overflow-auto`}>
                <canvas
                    ref={canvasRef}
                    width={2000} // Expand significantly for scrollability
                    height={2000}
                    className={`block ${!isPanning ? 'touch-none cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                    style={{ minWidth: '2000px', minHeight: '2000px' }}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    onTouchMove={draw}
                />
            </div>
        </div>
    );
}
