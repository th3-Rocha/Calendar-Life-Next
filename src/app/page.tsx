"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Info, ListTodo, User, X } from "lucide-react";
import { useLifeData } from "../hooks/useLifeData";
import LifeCalendarCanvas from "../components/LifeCalendarCanvas";
import DayModal from "../components/DayModal";
import DefaultTasksModal from "../components/DefaultTasksModal";
import AnalogClock from "../components/AnalogClock";


function SetupScreen({ completeSetup }: { completeSetup: (name: string, birthDate: string) => void }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate) {
      completeSetup(name, birthDate);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#111",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        width: "100%",
        maxWidth: "400px",
        border: "1px solid #333"
      }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", textAlign: "center" }}>Welcome to Chronos</h1>
        <p style={{ margin: "0 0 24px 0", color: "#888", textAlign: "center", fontSize: "0.95rem" }}>
          Let's setup your Life Calendar.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="name" style={{ fontSize: "0.9rem", color: "#ccc" }}>Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #333",
                backgroundColor: "#111",
                color: "#fff",
                fontSize: "1rem",
                outline: "none"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="birthDate" style={{ fontSize: "0.9rem", color: "#ccc" }}>Birth Date</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #333",
                backgroundColor: "#111",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                colorScheme: "dark"
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              padding: "14px",
              marginTop: "8px",
              backgroundColor: "#f5f5f5",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Start My Calendar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    data,
    isLoaded,
    updateSquareSize,
    updateDefaultTasks,
    updateShowHelp,
    completeSetup,
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

  
  if (isLoaded && !data.setupCompleted) {
    return <SetupScreen completeSetup={completeSetup} />;
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
        overflow: "hidden",
      }}
    >
      <style>{`
        .absolute { position: absolute; }
        .relative { position: relative; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .block { display: block; }
        .overflow-y-auto { overflow-y: auto; }
        .overflow-x-hidden { overflow-x: hidden; }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background-color: #0a0a0a;
          border-bottom: 1px solid #222;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .legend-bar {
          display: flex;
          gap: 24px;
          padding: 12px 32px;
          font-size: 0.85rem;
          background-color: #111;
          border-bottom: 1px solid #222;
          color: #aaa;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 76px;
          z-index: 90;
        }

        .legend-items {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .header-title-subtitle {
          display: block;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .header-controls {
            width: 100%;
            justify-content: flex-start;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 4px; /* Space for scrollbar */
          }

          /* Hide scrollbar for header controls but allow scroll */
          .header-controls::-webkit-scrollbar {
            display: none;
          }
          .header-controls {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }

          .header-title-subtitle p {
            display: none;
          }

          .header-title-subtitle h1 {
            font-size: 1.25rem;
          }

          /* Hide separator lines on mobile to save space */
          .separator-line {
            display: none !important;
          }

          .legend-bar {
            padding: 10px 16px;
            top: 105px; /* Re-adjusted for the new two-row mobile header */
            overflow-x: auto; /* Let legends scroll horizontally */
            white-space: nowrap;
          }

          .legend-bar::-webkit-scrollbar {
            display: none;
          }

          .legend-items {
            flex-wrap: nowrap; /* Keep on one line and let it scroll */
            gap: 16px;
          }
        }
      `}</style>
      {/* Header */}
      <header className="header-container">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <AnalogClock />
          <div className="header-title-subtitle">
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

        <div className="header-controls">
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
            className="separator-line"
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
      {data.showHelp !== false && (
        <div className="legend-bar">
          <div className="legend-items">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500",
              }}
            >
              <span style={{ color: "#4b5563", fontSize: "1.1rem" }}>■</span>{" "}
              Past (Unrecorded)
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
              <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>■</span>{" "}
              Failed / Missed
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500",
              }}
            >
              <span style={{ color: "#f97316", fontSize: "1.1rem" }}>■</span>{" "}
              Today
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500",
              }}
            >
              <span style={{ color: "#d1d5db", fontSize: "1.1rem" }}>□</span>{" "}
              Future
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "10px" }}></div>
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
            <button
              onClick={() => updateShowHelp(false)}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                marginLeft: "12px",
              }}
              title="Hide Help"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

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
        <div
          style={{
            flex: 1,
            position: "relative",
            height: "100%",
            minHeight: 0,
          }}
        >
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
