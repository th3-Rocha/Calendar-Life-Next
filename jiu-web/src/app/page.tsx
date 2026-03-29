"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Info, ListTodo, User } from "lucide-react";
import { useLifeData } from "../hooks/useLifeData";
import LifeCalendarCanvas from "../components/LifeCalendarCanvas";
import DayModal from "../components/DayModal";
import DefaultTasksModal from "../components/DefaultTasksModal";
import AnalogClock from "../components/AnalogClock";

export default function Home() {
  const {
    data,
    isLoaded,
    updateSquareSize,
    updateDefaultTasks,
    updateStatuses,
    updateDayDetails,
  } = useLifeData();
  const [isDefaultTasksModalOpen, setIsDefaultTasksModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#111",
          color: "#fff",
        }}
      >
        Loading Life Calendar...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#111",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          backgroundColor: "#0a0a0a",
          borderBottom: "1px solid #222",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <AnalogClock />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "bold",
                letterSpacing: "-0.5px",
              }}
            >
              {data.name ? `${data.name}'s Life` : "Life Calendar"}
            </h1>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.85rem",
                color: "#888",
                letterSpacing: "0.2px",
              }}
            >
              ~80 Years • 29,200 Days • Make them count.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="squareSize"
              style={{
                fontSize: "0.7rem",
                color: "#666",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Zoom
            </label>
            <input
              id="squareSize"
              type="range"
              min="8"
              max="32"
              step="2"
              value={data.squareSize || 14}
              onChange={(e) => updateSquareSize(Number(e.target.value))}
              style={{ width: "80px", cursor: "pointer", accentColor: "#fff" }}
            />
          </div>

          <div
            style={{ width: "1px", height: "32px", backgroundColor: "#333" }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setIsDefaultTasksModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "transparent",
                color: "#ddd",
                border: "1px solid #444",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#222")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title="Manage Default Tasks"
            >
              <ListTodo size={16} />
              <span>Tasks</span>
            </button>

            <Link
              href="/info"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#fff",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "bold",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#ddd")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
              title="Settings & Info"
            >
              <User size={16} />
              <span>{data.name || "Info"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Legend / Info Bar */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          padding: "12px 32px",
          fontSize: "0.85rem",
          backgroundColor: "#111",
          borderBottom: "1px solid #222",
          color: "#aaa",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
          }}
        >
          <span style={{ color: "#4b5563", fontSize: "1.1rem" }}>■</span> Past
          (Unrecorded)
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
          }}
        >
          <span style={{ color: "#22c55e", fontSize: "1.1rem" }}>■</span>{" "}
          Completed
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
          }}
        >
          <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>■</span> Failed
          / Missed
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
          }}
        >
          <span style={{ color: "#d1d5db", fontSize: "1.1rem" }}>□</span> Future
        </div>

        <div style={{ flex: 1 }}></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#888",
            fontStyle: "italic",
          }}
        >
          <Info size={14} /> Right-click to toggle colors. Drag right-click to
          paint multiple.
        </div>
      </div>

      {/* Canvas Area */}
      <main
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <LifeCalendarCanvas
            birthDate={data.birthDate}
            statuses={data.statuses}
            onUpdateStatus={updateStatuses}
            onDayClick={(index) => setSelectedDayIndex(index)}
            squareSize={data.squareSize || 14}
          />
        </div>
      </main>

      {/* Day Details Modal */}
      <DayModal
        isOpen={selectedDayIndex !== null}
        onClose={() => setSelectedDayIndex(null)}
        dayIndex={selectedDayIndex}
        birthDate={data.birthDate}
        details={
          selectedDayIndex !== null ? data.days[selectedDayIndex] || null : null
        }
        defaultTasks={data.defaultTasks || []}
        onSave={updateDayDetails}
      />

      {/* Default Tasks Modal */}
      <DefaultTasksModal
        isOpen={isDefaultTasksModalOpen}
        onClose={() => setIsDefaultTasksModalOpen(false)}
        defaultTasks={data.defaultTasks || []}
        onSave={updateDefaultTasks}
      />
    </div>
  );
}
