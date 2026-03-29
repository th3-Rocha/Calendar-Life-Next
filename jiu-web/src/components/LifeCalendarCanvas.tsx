import React, { useEffect, useRef } from "react";
import { differenceInDays, addDays, format } from "date-fns";
import { DayStatus } from "../hooks/useLifeData";

interface LifeCalendarCanvasProps {
  birthDate: string;
  statuses: Record<number, DayStatus>;
  onUpdateStatus: (indices: number[], status: DayStatus | null) => void;
  onDayClick: (index: number) => void;
  squareSize: number;
}

const TOTAL_DAYS = 80 * 365;
const FONT_FAMILY = "monospace";
const CHAR = "■";
const FUTURE_CHAR = "□";

export default function LifeCalendarCanvas({
  birthDate,
  statuses,
  onUpdateStatus,
  onDayClick,
  squareSize,
}: LifeCalendarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  // We bypass React state entirely for interaction to achieve 180+ FPS
  const stateRef = useRef({
    width: 0,
    height: 0,
    charWidth: 8,
    cols: 0,
    hoverIndex: -1 as number,
    isDragging: false,
    dragStart: -1 as number,
    dragEnd: -1 as number,
    dragTargetStatus: null as DayStatus | null,
    todayIndex: 0,
    dpr: 1,
  });

  // Offscreen canvas for caching the static grid
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate todayIndex whenever birthDate changes
  useEffect(() => {
    // Append T00:00:00 to force parsing in local timezone instead of UTC
    const start = new Date(birthDate + "T00:00:00");
    const today = new Date();
    stateRef.current.todayIndex = Math.max(0, differenceInDays(today, start));
  }, [birthDate]);

  // Handle Resize and Cache Regeneration
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offCtx = offscreenCanvasRef.current.getContext("2d", {
      alpha: false,
    });
    if (!offCtx) return;

    const buildCache = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;

      const lineHeight = Math.floor(squareSize * 1.2);
      const hoverFontSize = Math.floor(squareSize * 1.5);

      // Temporary offCtx setup to measure text accurately
      offCtx.font = `${squareSize}px ${FONT_FAMILY}`;
      const charWidth = offCtx.measureText(CHAR).width;
      const totalCharWidth =
        charWidth + Math.max(2, Math.floor(squareSize * 0.2));
      stateRef.current.charWidth = totalCharWidth;

      const cols = Math.max(1, Math.floor((width - 40) / totalCharWidth));
      stateRef.current.cols = cols;

      const rows = Math.ceil(TOTAL_DAYS / cols);
      const startX = 20;
      const startY = 30;
      const height = startY + rows * lineHeight + 30; // Added 30px bottom padding

      stateRef.current.width = width;
      stateRef.current.height = height;
      stateRef.current.dpr = dpr;

      // Setup main canvas
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Setup offscreen canvas
      offscreenCanvasRef.current!.width = width * dpr;
      offscreenCanvasRef.current!.height = height * dpr;

      offCtx.scale(dpr, dpr);
      offCtx.fillStyle = "#111"; // Match app background
      offCtx.fillRect(0, 0, width, height);

      offCtx.font = `${squareSize}px ${FONT_FAMILY}`;
      offCtx.textBaseline = "top";
      const today = stateRef.current.todayIndex;

      // Draw all days to the offscreen canvas (Heavy operation, done ONCE)
      for (let i = 0; i < TOTAL_DAYS; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * totalCharWidth;
        const y = startY + row * lineHeight;

        // Color logic
        if (i > today) {
          offCtx.fillStyle = "#d1d5db";
        } else {
          const status = statuses[i];
          if (status === "completed") offCtx.fillStyle = "#22c55e";
          else if (status === "failed") offCtx.fillStyle = "#ef4444";
          else offCtx.fillStyle = "#4b5563";
        }

        offCtx.fillText(i > today ? FUTURE_CHAR : CHAR, x, y);
      }

      drawFrame();
    };

    const drawFrame = () => {
      const {
        width,
        height,
        dpr,
        hoverIndex,
        isDragging,
        dragStart,
        dragEnd,
        cols,
        charWidth,
      } = stateRef.current;

      // Reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // 1. Draw cached background directly (Blazing fast)
      ctx.drawImage(
        offscreenCanvasRef.current!,
        0,
        0,
        width * dpr,
        height * dpr,
      );

      ctx.scale(dpr, dpr);
      ctx.textBaseline = "top";

      const lineHeight = Math.floor(squareSize * 1.2);
      const hoverFontSize = Math.floor(squareSize * 1.5);

      const startX = 20;
      const startY = 30;

      // 2. Draw active drag selection
      if (isDragging && dragStart !== -1 && dragEnd !== -1) {
        const min = Math.min(dragStart, dragEnd);
        const max = Math.max(dragStart, dragEnd);

        ctx.fillStyle = "rgba(59, 130, 246, 0.5)"; // Semi-transparent blue
        for (let i = min; i <= max; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = startX + col * charWidth;
          const y = startY + row * lineHeight;
          ctx.fillRect(x, y - 2, charWidth, lineHeight);
        }
      }

      // 3. Draw hover effect over the cache
      if (hoverIndex !== -1) {
        const col = hoverIndex % cols;
        const row = Math.floor(hoverIndex / cols);
        const x = startX + col * charWidth;
        const y = startY + row * lineHeight;

        const charToDraw =
          hoverIndex > stateRef.current.todayIndex ? FUTURE_CHAR : CHAR;

        // Clear background for the hovered char
        ctx.fillStyle = "#111";
        ctx.fillRect(x - 2, y - 2, charWidth + 4, lineHeight + 4);

        // Draw enlarged
        const status = statuses[hoverIndex];
        if (hoverIndex > stateRef.current.todayIndex) ctx.fillStyle = "#d1d5db";
        else if (status === "completed") ctx.fillStyle = "#22c55e";
        else if (status === "failed") ctx.fillStyle = "#ef4444";
        else ctx.fillStyle = "#4b5563";

        ctx.font = `bold ${hoverFontSize}px ${FONT_FAMILY}`;
        ctx.fillText(
          charToDraw,
          x - (hoverFontSize - squareSize) / 2,
          y - (hoverFontSize - squareSize) / 2,
        );
      }
    };

    let animationFrameId: number;
    const requestDraw = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    const getIndexFromEvent = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 20; // 20px padding
      const y = e.clientY - rect.top - 30; // 30px padding

      if (x < 0 || y < 0) return -1;

      const lineHeight = Math.floor(squareSize * 1.2);

      const col = Math.floor(x / stateRef.current.charWidth);
      const row = Math.floor(y / lineHeight);

      if (col >= stateRef.current.cols) return -1;

      const index = row * stateRef.current.cols + col;
      if (index >= TOTAL_DAYS) return -1;

      return index;
    };

    // Fast Native Event Listeners
    const onMouseMove = (e: MouseEvent) => {
      const index = getIndexFromEvent(e);
      const state = stateRef.current;

      let needsDraw = false;

      if (index !== state.hoverIndex) {
        state.hoverIndex = index;
        needsDraw = true;

        // Update cursor style
        if (index !== -1 && index <= state.todayIndex) {
          canvas.style.cursor = "pointer";
        } else {
          canvas.style.cursor = "crosshair";
        }

        if (hudRef.current) {
          if (index !== -1) {
            // Append T00:00:00 to force parsing in local timezone instead of UTC
            const date = addDays(new Date(birthDate + "T00:00:00"), index);
            let statusText = "Past (Unrecorded)";

            if (index > state.todayIndex) {
              statusText = "Future";
            } else {
              const s = statuses[index];
              if (s === "completed") statusText = "Completed";
              else if (s === "failed") statusText = "Failed";
            }

            hudRef.current.style.opacity = "1";
            hudRef.current.innerHTML = `
              <div style="font-size: 0.85rem; color: #888; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">Day ${index + 1}</div>
              <div style="font-size: 1.1rem; font-weight: bold; margin: 4px 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${format(date, "MMMM do, yyyy")}</div>
              <div style="font-size: 0.9rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: ${
                statusText === "Completed"
                  ? "#22c55e"
                  : statusText === "Failed"
                    ? "#ef4444"
                    : statusText === "Future"
                      ? "#d1d5db"
                      : "#888"
              };">${statusText}</div>
            `;
          } else {
            hudRef.current.style.opacity = "0";
          }
        }
      }

      if (state.isDragging && index !== -1 && index !== state.dragEnd) {
        state.dragEnd = index;
        needsDraw = true;
      }

      if (needsDraw) requestDraw();
    };

    const onMouseDown = (e: MouseEvent) => {
      // Prevent default to stop text selection or right-click menu
      e.preventDefault();

      const index = getIndexFromEvent(e);

      if (index !== -1 && index <= stateRef.current.todayIndex) {
        const state = stateRef.current;

        // Right click handles color changing exclusively now
        if (e.button === 2) {
          const currentStatus = statuses[index];
          let nextStatus: DayStatus | null = null;

          if (!currentStatus) nextStatus = "completed";
          else if (currentStatus === "completed") nextStatus = "failed";

          state.isDragging = true;
          state.dragStart = index;
          state.dragEnd = index;
          state.dragTargetStatus = nextStatus;

          requestDraw();
          return;
        }

        // Left click is just for opening modal, so we record it but don't drag-paint
        state.dragStart = index;
        state.dragEnd = index;
        // isDragging is false for left clicks to avoid painting
      }
    };

    const onClick = (e: MouseEvent) => {
      const index = getIndexFromEvent(e);
      if (
        index !== -1 &&
        index <= stateRef.current.todayIndex &&
        e.button === 0
      ) {
        onDayClick(index);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Stop native right-click menu
    };

    const onMouseUp = () => {
      const state = stateRef.current;
      if (state.isDragging && state.dragStart !== -1 && state.dragEnd !== -1) {
        const min = Math.min(state.dragStart, state.dragEnd);
        const max = Math.max(state.dragStart, state.dragEnd);

        const indices = [];
        for (let i = min; i <= max; i++) indices.push(i);

        // This will trigger a React re-render of the parent, which passes new statuses
        onUpdateStatus(indices, state.dragTargetStatus);
      }
      state.isDragging = false;
      state.dragStart = -1;
      state.dragEnd = -1;
      requestDraw();
    };

    const onMouseLeave = () => {
      stateRef.current.hoverIndex = -1;
      stateRef.current.isDragging = false;
      if (hudRef.current) hudRef.current.style.opacity = "0";
      requestDraw();
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", buildCache);

    buildCache();

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", buildCache);
      cancelAnimationFrame(animationFrameId);
    };
  }, [birthDate, statuses, onUpdateStatus, onDayClick, squareSize]); // Depend on statuses and size to rebuild cache

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden"
    >
      <canvas ref={canvasRef} className="block w-full" />

      {/* Fixed HUD Overlay */}
      <div
        ref={hudRef}
        style={{
          opacity: 0,
          transition: "opacity 0.15s ease-in-out",
          pointerEvents: "none",
          position: "fixed",
          top: "100px",
          right: "48px",
          zIndex: 50,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          width: "250px",
          height: "100px",
          boxSizing: "border-box",
          color: "#fff",
        }}
      />
    </div>
  );
}
