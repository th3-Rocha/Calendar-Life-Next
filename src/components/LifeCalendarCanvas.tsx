import React, { useEffect, useRef, useState } from "react";
import { format, differenceInDays, addDays } from "date-fns";

// Apple-esque sans-serif font
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TOTAL_DAYS = 29200; // ~80 years
const CHAR = "■"; // Filled square
const FUTURE_CHAR = "□"; // Empty square for future

interface LifeCalendarCanvasProps {
  birthDate: string; // YYYY-MM-DD
  statuses: Record<number, "completed" | "failed">;
  onUpdateStatus: (indices: number[], status: "completed" | "failed" | null) => void;
  onDayClick: (index: number) => void;
  squareSize?: number;
}

export default function LifeCalendarCanvas({
  birthDate,
  statuses,
  onUpdateStatus,
  onDayClick,
  squareSize = 14,
}: LifeCalendarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const [totalHeight, setTotalHeight] = useState(0);

  // Non-React state for the hot render loop
  const stateRef = useRef({
    todayIndex: 0,
    cols: 0,
    charWidth: 0,
    lineHeight: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    hoverIndex: -1,
    hoverScale: 0,
    isDragging: false,
    dragStart: -1,
    dragEnd: -1,
    dragTargetStatus: null as "completed" | "failed" | null,
    needsDraw: true, // Force initial draw
  });

  const scrolledInitial = useRef(false);

  // 1. Compute today index
  useEffect(() => {
    const start = new Date(birthDate + "T00:00:00");
    const today = new Date();
    stateRef.current.todayIndex = Math.max(0, differenceInDays(today, start));
    stateRef.current.needsDraw = true;
  }, [birthDate]);

  // 2. Measure Layout whenever viewport or squareSize changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measureLayout = () => {
      const width = Math.max(100, container.clientWidth);
      const height = Math.max(100, container.clientHeight);

      // Make layout purely mathematical based on squareSize for maximum consistency
      const totalCharWidth = squareSize + Math.max(2, Math.floor(squareSize * 0.2));
      const lineHeight = totalCharWidth + Math.max(1, Math.floor(squareSize * 0.1));

      const cols = Math.max(1, Math.floor((width - 40) / totalCharWidth));
      const rows = Math.ceil(TOTAL_DAYS / cols);
      const calcHeight = 30 + rows * lineHeight + 30; // 30px padding top/bottom

      stateRef.current.viewportWidth = width;
      stateRef.current.viewportHeight = height;
      stateRef.current.lineHeight = lineHeight;
      stateRef.current.charWidth = totalCharWidth;
      stateRef.current.cols = cols;

      setTotalHeight(calcHeight);
      stateRef.current.needsDraw = true;

      // Auto-scroll to today on first load
      if (!scrolledInitial.current && cols > 0) {
        const todayRow = Math.floor(stateRef.current.todayIndex / cols);
        const yPos = 30 + todayRow * lineHeight;
        const targetScroll = Math.max(0, yPos - height / 2);

        setTimeout(() => {
          container.scrollTo({ top: targetScroll, behavior: "smooth" });
          scrolledInitial.current = true;
        }, 100);
      }
    };

    window.addEventListener("resize", measureLayout);
    measureLayout();

    return () => window.removeEventListener("resize", measureLayout);
  }, [squareSize, birthDate]);

  // 3. The Render Loop & Event Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId: number;
    let lastScrollTop = -1;

    const drawFrame = (scrollTop: number) => {
      const state = stateRef.current;
      if (state.cols === 0) return;

      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== state.viewportWidth * dpr ||
        canvas.height !== state.viewportHeight * dpr
      ) {
        canvas.width = state.viewportWidth * dpr;
        canvas.height = state.viewportHeight * dpr;
        canvas.style.width = `${state.viewportWidth}px`;
        canvas.style.height = `${state.viewportHeight}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, state.viewportWidth, state.viewportHeight);

      const startX = 20;
      const startY = 30;

      // Only loop through rows that are visible on screen
      const firstVisibleRow = Math.max(0, Math.floor((scrollTop - startY) / state.lineHeight));
      const lastVisibleRow = Math.min(
        Math.ceil(TOTAL_DAYS / state.cols),
        Math.floor((scrollTop + state.viewportHeight - startY) / state.lineHeight) + 1
      );

      ctx.font = `${squareSize}px ${FONT_FAMILY}`;
      ctx.textBaseline = "top";

      // Draw Grid with extreme performance (Rectangles instead of Fonts)
      const paths = {
        past: new Path2D(),
        completed: new Path2D(),
        failed: new Path2D(),
        todayUnrecorded: new Path2D(),
        future: new Path2D(),
      };

      const rectSize = squareSize;
      const offsetX = Math.floor((state.charWidth - rectSize) / 2);
      const offsetY = Math.floor((state.lineHeight - rectSize) / 2);

      for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
        const y = startY + row * state.lineHeight - scrollTop + offsetY;
        for (let col = 0; col < state.cols; col++) {
          const i = row * state.cols + col;
          if (i >= TOTAL_DAYS) break;

          if (i === state.hoverIndex && state.hoverScale > 0) continue;

          const x = startX + col * state.charWidth + offsetX;

          if (i > state.todayIndex) {
            paths.future.rect(x, y, rectSize, rectSize);
          } else if (i === state.todayIndex && !statuses[i]) {
            paths.todayUnrecorded.rect(x, y, rectSize, rectSize);
          } else {
            const status = statuses[i];
            if (status === "completed") paths.completed.rect(x, y, rectSize, rectSize);
            else if (status === "failed") paths.failed.rect(x, y, rectSize, rectSize);
            else paths.past.rect(x, y, rectSize, rectSize);
          }
        }
      }

      ctx.fillStyle = "#555";
      ctx.fill(paths.past);

      ctx.fillStyle = "#22c55e";
      ctx.fill(paths.completed);

      ctx.fillStyle = "#ef4444";
      ctx.fill(paths.failed);

      ctx.fillStyle = "#f97316";
      ctx.fill(paths.todayUnrecorded);

      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.stroke(paths.future);

      // Draw Drag Selection
      if (state.isDragging && state.dragStart !== -1 && state.dragEnd !== -1) {
        const min = Math.min(state.dragStart, state.dragEnd);
        const max = Math.max(state.dragStart, state.dragEnd);

        ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
        for (let i = min; i <= max; i++) {
          const col = i % state.cols;
          const row = Math.floor(i / state.cols);
          if (row < firstVisibleRow || row > lastVisibleRow) continue;

          const x = startX + col * state.charWidth;
          const y = startY + row * state.lineHeight - scrollTop;
          ctx.fillRect(x - 2, y - 2, state.charWidth, state.lineHeight);
        }
      }

      // Draw Hover Item
      if (state.hoverIndex !== -1 && state.hoverScale > 0) {
        const col = state.hoverIndex % state.cols;
        const row = Math.floor(state.hoverIndex / state.cols);
        const x = startX + col * state.charWidth;
        const y = startY + row * state.lineHeight - scrollTop;

        const baseHoverFontSize = Math.floor(squareSize * 3.5);
        const currentHoverFontSize = squareSize + (baseHoverFontSize - squareSize) * state.hoverScale;

        const sizeDiff = currentHoverFontSize - squareSize;
        const hoverX = x - sizeDiff * 0.35;
        const hoverY = y - sizeDiff * 0.45;

        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10 * state.hoverScale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * state.hoverScale;

        if (state.hoverIndex > state.todayIndex) {
          ctx.fillStyle = "#ffffff";
        } else if (state.hoverIndex === state.todayIndex && !statuses[state.hoverIndex]) {
          ctx.fillStyle = "#fbd38d";
        } else {
          const status = statuses[state.hoverIndex];
          if (status === "completed") ctx.fillStyle = "#4ade80";
          else if (status === "failed") ctx.fillStyle = "#f87171";
          else ctx.fillStyle = "#9ca3af";
        }

        const hRectSize = currentHoverFontSize;
        const hOffsetX = startX + col * state.charWidth + (state.charWidth - hRectSize) / 2;
        const hOffsetY = startY + row * state.lineHeight - scrollTop + (state.lineHeight - hRectSize) / 2;

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2 * state.hoverScale;
        
        if (state.hoverIndex > state.todayIndex) {
          ctx.strokeRect(hOffsetX, hOffsetY, hRectSize, hRectSize);
        } else {
          ctx.strokeRect(hOffsetX, hOffsetY, hRectSize, hRectSize);
          ctx.fillRect(hOffsetX, hOffsetY, hRectSize, hRectSize);
        }
        ctx.shadowColor = "transparent";
      }
    };

    const renderLoop = () => {
      let shouldDraw = false;
      const currentScrollTop = container.scrollTop;
      const state = stateRef.current;

      if (currentScrollTop !== lastScrollTop) {
        shouldDraw = true;
      }

      // Smooth Hover Animation
      if (state.hoverIndex !== -1 && state.hoverScale < 1) {
        state.hoverScale = Math.min(1, state.hoverScale + 0.15);
        shouldDraw = true;
      } else if (state.hoverIndex === -1 && state.hoverScale > 0) {
        state.hoverScale = 0;
        shouldDraw = true;
      }

      if (state.needsDraw) {
        shouldDraw = true;
        state.needsDraw = false;
      }

      if (shouldDraw) {
        drawFrame(currentScrollTop);
        lastScrollTop = currentScrollTop;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    // Start loop
    rafId = requestAnimationFrame(renderLoop);

    const getIndexFromEvent = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      // Calculate relative to the canvas itself
      const x = clientX - rect.left - 20;
      // Add scrollTop because rect.top is relative to viewport, but our grid lives in a scrolled space
      const y = (clientY - rect.top) + container.scrollTop - 30; 

      if (x < 0 || y < 0) return -1;

      const col = Math.floor(x / stateRef.current.charWidth);
      const row = Math.floor(y / stateRef.current.lineHeight);

      if (col >= stateRef.current.cols) return -1;

      const index = row * stateRef.current.cols + col;
      if (index >= TOTAL_DAYS) return -1;

      return index;
    };

    const onMouseMove = (e: MouseEvent) => {
      const index = getIndexFromEvent(e);
      const state = stateRef.current;

      if (index !== state.hoverIndex) {
        state.hoverIndex = index;
        state.hoverScale = 0;
        state.needsDraw = true;

        if (index !== -1 && index <= state.todayIndex) {
          canvas.style.cursor = "pointer";
        } else {
          canvas.style.cursor = "crosshair";
        }

        if (hudRef.current) {
          if (index !== -1) {
            const date = addDays(new Date(birthDate + "T00:00:00"), index);
            let statusText = "Past (Unrecorded)";
            if (index > state.todayIndex) statusText = "Future";
            else if (index === state.todayIndex && !statuses[index]) statusText = "Today";
            else if (statuses[index] === "completed") statusText = "Completed";
            else if (statuses[index] === "failed") statusText = "Failed";

            hudRef.current.style.opacity = "1";
            hudRef.current.innerHTML = `
              <div style="font-size: 0.85rem; color: #888; white-space: nowrap;">Day ${index + 1}</div>
              <div style="font-size: 1.1rem; font-weight: bold; margin: 4px 0; white-space: nowrap;">${format(date, "MMMM do, yyyy")}</div>
              <div style="font-size: 0.9rem; white-space: nowrap; color: ${
                statusText === "Completed" ? "#22c55e" : statusText === "Failed" ? "#ef4444" : statusText === "Future" ? "#d1d5db" : statusText === "Today" ? "#f97316" : "#aaa"
              }">${statusText}</div>`;
          } else {
            hudRef.current.style.opacity = "0";
          }
        }
      }

      if (state.isDragging && index !== -1 && index <= state.todayIndex) {
        state.dragEnd = index;
        state.needsDraw = true;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const index = getIndexFromEvent(e);
      if (index === -1) return;
      const state = stateRef.current;

      if (e.button === 2 && index <= state.todayIndex) {
        state.isDragging = true;
        state.dragStart = index;
        state.dragEnd = index;
        
        const current = statuses[index];
        if (!current) state.dragTargetStatus = "completed";
        else if (current === "completed") state.dragTargetStatus = "failed";
        else state.dragTargetStatus = null;

        state.needsDraw = true;
      } else {
        state.dragStart = index;
        state.dragEnd = index;
      }
    };

    const onClick = (e: MouseEvent) => {
      const index = getIndexFromEvent(e);
      if (index !== -1 && index <= stateRef.current.todayIndex && e.button === 0) {
        onDayClick(index);
      }
    };

    const onMouseUp = () => {
      const state = stateRef.current;
      if (state.isDragging && state.dragStart !== -1 && state.dragEnd !== -1) {
        const min = Math.min(state.dragStart, state.dragEnd);
        const max = Math.max(state.dragStart, state.dragEnd);
        const indices = [];
        for (let i = min; i <= max; i++) indices.push(i);
        onUpdateStatus(indices, state.dragTargetStatus);
      }
      state.isDragging = false;
      state.dragStart = -1;
      state.dragEnd = -1;
      state.needsDraw = true;
    };

    const onMouseLeave = () => {
      stateRef.current.hoverIndex = -1;
      stateRef.current.isDragging = false;
      stateRef.current.needsDraw = true;
      if (hudRef.current) hudRef.current.style.opacity = "0";
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [birthDate, statuses, onUpdateStatus, onDayClick, squareSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Invisible element to force scroll height */}
      <div style={{ height: `${totalHeight}px`, width: 1 }} />
      
      {/* Fixed canvas that sticks to viewport */}
      <div style={{ position: "sticky", top: 0, left: 0, width: "100%", height: "100%", marginTop: `-${totalHeight}px` }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>

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
          boxSizing: "border-box",
          color: "#fff",
        }}
      />
    </div>
  );
}
