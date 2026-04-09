import React, { useEffect, useRef, useState } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { prepareWithSegments, measureNaturalWidth } from "@chenglou/pretext";

// Apple-esque sans-serif font
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TOTAL_DAYS = 29200; // ~80 years
const CHAR = "■"; // Filled square
const FUTURE_CHAR = "□"; // Empty square for future

interface LifeCalendarCanvasProps {
  birthDate: string; // YYYY-MM-DD
  statuses: Record<number, "completed" | "failed">;
  onDayClick: (index: number) => void;
  squareSize?: number;
}

export default function LifeCalendarCanvas({
  birthDate,
  statuses,
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
    needsDraw: true, // Force initial draw
    measuredCharWidth: 0,
    actualCharWidth: 0, // raw float advance — used for exact letterSpacing
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

      // Use pretext to get the actual measured width of ■ for accurate layout
      const charFont = `${squareSize}px ${FONT_FAMILY}`;
      const preparedChar = prepareWithSegments(CHAR, charFont);
      const rawAdvance = measureNaturalWidth(preparedChar);
      const measuredWidth = Math.ceil(rawAdvance);

      const gap = Math.max(2, Math.round(measuredWidth * 0.2));
      const totalCharWidth = measuredWidth + gap;
      const lineHeight =
        totalCharWidth + Math.max(1, Math.round(totalCharWidth * 0.1));

      const cols = Math.max(1, Math.floor((width - 40) / totalCharWidth));
      const rows = Math.ceil(TOTAL_DAYS / cols);
      const calcHeight = 30 + rows * lineHeight + 30;

      stateRef.current.viewportWidth = width;
      stateRef.current.viewportHeight = height;
      stateRef.current.lineHeight = lineHeight;
      stateRef.current.charWidth = totalCharWidth;
      stateRef.current.measuredCharWidth = measuredWidth;
      stateRef.current.actualCharWidth = rawAdvance;
      stateRef.current.cols = cols;

      setTotalHeight(calcHeight);
      stateRef.current.needsDraw = true;

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
      if (state.cols === 0 || state.measuredCharWidth === 0) return;

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

      const firstVisibleRow = Math.max(
        0,
        Math.floor((scrollTop - startY) / state.lineHeight),
      );
      const lastVisibleRow = Math.min(
        Math.ceil(TOTAL_DAYS / state.cols),
        Math.floor(
          (scrollTop + state.viewportHeight - startY) / state.lineHeight,
        ) + 1,
      );

      // Offsets to center the measured character in each grid cell
      const mw = state.measuredCharWidth;
      const offsetX = Math.floor((state.charWidth - mw) / 2);
      const offsetY = Math.floor((state.lineHeight - squareSize) / 2);

      // ── Grid characters: run-length encoded per row ──────────────────────
      // Within each row we track consecutive same-colour runs and render each
      // as a single fillText call. letterSpacing is set so every glyph lands
      // at exactly charWidth intervals — zero drift across run boundaries.
      ctx.font = `${squareSize}px ${FONT_FAMILY}`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      // letterSpacing = charWidth - actualAdvance makes every glyph land at
      // exactly charWidth intervals with zero drift across run boundaries.
      ctx.letterSpacing = `${state.charWidth - state.actualCharWidth}px`;

      for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
        const y = startY + row * state.lineHeight - scrollTop + offsetY;
        const rowStartI = row * state.cols;

        let runStartCol = 0;
        let runColor = "";
        let runChar = "";
        let runLen = 0;

        const flushRun = () => {
          if (runLen === 0) return;
          const x = startX + runStartCol * state.charWidth + offsetX;
          ctx.fillStyle = runColor;
          ctx.fillText(runChar.repeat(runLen), x, y);
          runLen = 0;
        };

        for (let col = 0; col < state.cols; col++) {
          const i = rowStartI + col;
          if (i >= TOTAL_DAYS) {
            flushRun();
            break;
          }

          // Skip the square that the hover effect will draw enlarged
          if (i === state.hoverIndex && state.hoverScale > 0) {
            flushRun();
            runStartCol = col + 1;
            continue;
          }

          let color: string;
          let char: string;
          if (i > state.todayIndex) {
            color = "#888";
            char = FUTURE_CHAR;
          } else if (i === state.todayIndex && !statuses[i]) {
            color = "#f97316";
            char = CHAR;
          } else {
            char = CHAR;
            const status = statuses[i];
            if (status === "completed") color = "#22c55e";
            else if (status === "failed") color = "#ef4444";
            else color = "#555";
          }

          if (color === runColor && char === runChar) {
            runLen++;
          } else {
            flushRun();
            runStartCol = col;
            runColor = color;
            runChar = char;
            runLen = 1;
          }
        }
        flushRun(); // flush the final run in this row
      }

      ctx.letterSpacing = "0px";

      // ── Hover character (scaled, perfectly centered, with shadow) ─────────
      if (state.hoverIndex !== -1 && state.hoverScale > 0) {
        const col = state.hoverIndex % state.cols;
        const row = Math.floor(state.hoverIndex / state.cols);

        const baseHoverFontSize = Math.floor(squareSize * 3.5);
        const currentHoverFontSize =
          squareSize + (baseHoverFontSize - squareSize) * state.hoverScale;

        if (state.hoverIndex > state.todayIndex) {
          ctx.fillStyle = "#ffffff";
        } else if (
          state.hoverIndex === state.todayIndex &&
          !statuses[state.hoverIndex]
        ) {
          ctx.fillStyle = "#fbd38d";
        } else {
          const status = statuses[state.hoverIndex];
          if (status === "completed") ctx.fillStyle = "#4ade80";
          else if (status === "failed") ctx.fillStyle = "#f87171";
          else ctx.fillStyle = "#9ca3af";
        }

        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10 * state.hoverScale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * state.hoverScale;

        const hChar = state.hoverIndex > state.todayIndex ? FUTURE_CHAR : CHAR;
        ctx.font = `${Math.round(currentHoverFontSize)}px ${FONT_FAMILY}`;

        // textAlign=center + textBaseline=middle: the canvas engine places
        // the glyph's visual center at (hCenterX, hCenterY) — no manual
        // offset math, no font-metrics guesswork.
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const hCenterX = startX + col * state.charWidth + state.charWidth / 2;
        const hCenterY =
          startY + row * state.lineHeight - scrollTop + state.lineHeight / 2;

        ctx.fillText(hChar, hCenterX, hCenterY);

        // Reset so nothing bleeds into the next frame
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
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
      const clientX =
        e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY =
        e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      // Calculate relative to the canvas itself
      const x = clientX - rect.left - 20;
      // Add scrollTop because rect.top is relative to viewport, but our grid lives in a scrolled space
      const y = clientY - rect.top + container.scrollTop - 30;

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
            else if (index === state.todayIndex && !statuses[index])
              statusText = "Today";
            else if (statuses[index] === "completed") statusText = "Completed";
            else if (statuses[index] === "failed") statusText = "Failed";

            hudRef.current.style.opacity = "1";
            hudRef.current.innerHTML = `
              <div style="font-size: 0.85rem; color: #888; white-space: nowrap;">Day ${index + 1}</div>
              <div style="font-size: 1.1rem; font-weight: bold; margin: 4px 0; white-space: nowrap;">${format(date, "MMMM do, yyyy")}</div>
              <div style="font-size: 0.9rem; white-space: nowrap; color: ${
                statusText === "Completed"
                  ? "#22c55e"
                  : statusText === "Failed"
                    ? "#ef4444"
                    : statusText === "Future"
                      ? "#d1d5db"
                      : statusText === "Today"
                        ? "#f97316"
                        : "#aaa"
              }">${statusText}</div>`;
          } else {
            hudRef.current.style.opacity = "0";
          }
        }
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

    const onMouseLeave = () => {
      stateRef.current.hoverIndex = -1;
      stateRef.current.needsDraw = true;
      if (hudRef.current) hudRef.current.style.opacity = "0";
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [birthDate, statuses, onDayClick, squareSize]);

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
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          marginTop: `-${totalHeight}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
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
