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

  // Initialize canvas size once
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

  // Update context properties without clearing canvas
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctxRef.current.globalCompositeOperation = isEraser
        ? "destination-out"
        : "source-over";
    }
  }, [brushSize, color, isEraser]);

  // Listen for drawing updates from other players
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

        // Save current context
        ctxRef.current.save();

        // Apply drawing settings
        ctxRef.current.lineWidth = drawSize;
        ctxRef.current.strokeStyle = drawEraser ? "#FFFFFF" : drawColor;
        ctxRef.current.globalCompositeOperation = drawEraser
          ? "destination-out"
          : "source-over";

        // Draw the line
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(prevX, prevY);
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();

        // Restore context
        ctxRef.current.restore();
      }
    };

    socket.on("drawing-update", handleDrawingUpdate);

    return () => {
      socket.off("drawing-update", handleDrawingUpdate);
    };
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

      // Get previous position
      const prevX = ctxRef.current.currentX || x;
      const prevY = ctxRef.current.currentY || y;

      // Draw locally
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();

      // Send drawing data to other players
      if (onDrawing && isMultiplayer) {
        onDrawing({
          x,
          y,
          prevX,
          prevY,
          color,
          brushSize,
          isEraser,
        });
      }

      // Update current position
      ctxRef.current.currentX = x;
      ctxRef.current.currentY = y;
    },
    [
      isDrawing,
      isReadOnly,
      onDrawing,
      isMultiplayer,
      color,
      brushSize,
      isEraser,
    ],
  );

  const clearCanvas = useCallback(() => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isReadOnly]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-96 md:h-[500px] border-4 border-gray-300 rounded-xl shadow-2xl bg-white cursor-crosshair hover:border-blue-400 transition-all duration-200"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseOut={finishDrawing}
      />
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setColor("#000000");
              setIsEraser(false);
            }}
            className="w-12 h-12 bg-black rounded-full shadow-md hover:shadow-lg transition-all ring-2 ring-gray-200 hover:ring-blue-300"
          />
          <button
            onClick={() => setColor("#FF0000")}
            className="w-12 h-12 bg-red-500 rounded-full shadow-md hover:shadow-lg transition-all ring-2 ring-gray-200 hover:ring-blue-300"
          />
          <button
            onClick={() => setColor("#0000FF")}
            className="w-12 h-12 bg-blue-500 rounded-full shadow-md hover:shadow-lg transition-all ring-2 ring-gray-200 hover:ring-blue-300"
          />
          <button
            onClick={() => setColor("#00FF00")}
            className="w-12 h-12 bg-green-500 rounded-full shadow-md hover:shadow-lg transition-all ring-2 ring-gray-200 hover:ring-blue-300"
          />
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Size: {brushSize}px
        </span>
        <button
          onClick={() => {
            setIsEraser(!isEraser);
            setColor("#FFFFFF");
          }}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            isEraser
              ? "bg-gray-600 text-white shadow-lg hover:bg-gray-700"
              : "bg-white border-2 border-gray-300 hover:border-gray-500 shadow-md hover:shadow-lg"
          }`}
        >
          {isEraser ? "Eraser ON" : "Eraser"}
        </button>
        <button
          onClick={clearCanvas}
          className="px-6 py-2 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600 hover:shadow-xl transition-all"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
