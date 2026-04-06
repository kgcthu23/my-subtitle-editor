import React, { useRef, useState, useEffect } from 'react';
import { Eraser } from 'lucide-react';

interface SharedCanvasProps {
    canvasData: string | undefined;
    onSave: (dataUrl: string) => void;
    disabled?: boolean;
}

export function SharedCanvas({ canvasData, onSave, disabled }: SharedCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);

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
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = canvasData;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [canvasData]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
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

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
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
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => { setColor(c); setIsEraser(false); }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c && !isEraser ? 'scale-110 border-white' : 'border-transparent scale-100'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                    />
                ))}
                <div className="w-px h-6 bg-zinc-700 mx-2" />
                <button
                    onClick={() => setIsEraser(true)}
                    className={`min-w-8 h-8 px-2 rounded flex items-center justify-center transition-all border-2 ${isEraser ? 'bg-zinc-700 border-white scale-110' : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                    title="Eraser"
                >
                    <Eraser className="w-4 h-4" />
                </button>
            </div>
            <div className="relative w-full h-[500px] bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    width={800} // internal resolution
                    height={500}
                    className="w-full h-full block touch-none"
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
