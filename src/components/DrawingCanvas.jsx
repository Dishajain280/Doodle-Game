import { useRef, useEffect, useCallback, useState } from "react";
import { useSocket } from "../contexts/SocketContext";

const DrawingCanvas = ({
  role = "drawer",
  onDrawing,
  isMultiplayer = false,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const { socket } = useSocket();

  const isReadOnly = role !== "drawer";

  const colors = [
    "#000000", "#ef4444", "#3b82f6", "#10b981", 
    "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctxRef.current.globalCompositeOperation = isEraser
        ? "destination-out"
        : "source-over";
    }
  }, [brushSize, color, isEraser]);

  useEffect(() => {
    if (!socket || !isMultiplayer) return;

    const handleDrawingUpdate = (drawingData) => {
      if (ctxRef.current && !isDrawing) {
        const {
          x,
          y,
          prevX,
          prevY,
          color: drawColor,
          brushSize: drawSize,
          isEraser: drawEraser,
        } = drawingData;

        ctxRef.current.save();
        ctxRef.current.lineWidth = drawSize;
        ctxRef.current.strokeStyle = drawEraser ? "#FFFFFF" : drawColor;
        ctxRef.current.globalCompositeOperation = drawEraser
          ? "destination-out"
          : "source-over";

        ctxRef.current.beginPath();
        ctxRef.current.moveTo(prevX, prevY);
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
        ctxRef.current.restore();
      }
    };

    socket.on("drawing-update", handleDrawingUpdate);
    return () => socket.off("drawing-update", handleDrawingUpdate);
  }, [socket, isMultiplayer, isDrawing]);

  const startDrawing = useCallback(
    (e) => {
      if (isReadOnly || !canvasRef.current || !ctxRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setIsDrawing(true);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    },
    [isReadOnly],
  );

  const finishDrawing = useCallback(() => {
    setIsDrawing(false);
    ctxRef.current?.beginPath();
  }, []);

  const draw = useCallback(
    (e) => {
      if (isReadOnly || !isDrawing || !ctxRef.current || !canvasRef.current)
        return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const prevX = ctxRef.current.currentX || x;
      const prevY = ctxRef.current.currentY || y;

      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();

      if (onDrawing && isMultiplayer) {
        onDrawing({ x, y, prevX, prevY, color, brushSize, isEraser });
      }

      ctxRef.current.currentX = x;
      ctxRef.current.currentY = y;
    },
    [isDrawing, isReadOnly, onDrawing, isMultiplayer, color, brushSize, isEraser],
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const handleClear = () => {
      clearCanvas();
    };
    window.addEventListener("clear-canvas", handleClear);
    return () => window.removeEventListener("clear-canvas", handleClear);
  }, [clearCanvas]);

  return (
    <div className="card p-2! flex flex-col gap-4 overflow-hidden shadow-2xl bg-white border-2 border-slate-200">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-100 md:h-125 bg-white cursor-crosshair transition-all duration-200"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
        />
        {isReadOnly && (
          <div className="absolute top-4 left-4 glass px-4 py-2 rounded-xl text-slate-600 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
            Watching Draw...
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform ring-2 ring-white ${
                  color === c && !isEraser ? "ring-brand-primary scale-110" : ""
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xs">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Size</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <span className="text-sm font-bold text-slate-600 w-8">{brushSize}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEraser(!isEraser);
                if (!isEraser) setColor("#FFFFFF");
              }}
              className={`p-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                isEraser
                  ? "bg-brand-primary text-white shadow-playful"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span>🧽</span>
              {isEraser ? "Eraser On" : "Eraser"}
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 px-4 bg-white border border-rose-200 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors flex items-center gap-2"
            >
              <span>🗑️</span>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
