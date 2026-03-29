"use client";

import React, { useState } from "react";
import { Settings, Info, ListTodo } from "lucide-react";
import { useLifeData } from "../hooks/useLifeData";
import LifeCalendarCanvas from "../components/LifeCalendarCanvas";
import JSONModal from "../components/JSONModal";
import DayModal from "../components/DayModal";
import DefaultTasksModal from "../components/DefaultTasksModal";

export default function Home() {
  const {
    data,
    isLoaded,
    updateBirthDate,
    updateSquareSize,
    updateDefaultTasks,
    updateStatuses,
    updateDayDetails,
    importData,
    exportData,
  } = useLifeData();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          padding: "16px 24px",
          backgroundColor: "#000",
          borderBottom: "1px solid #333",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
            Life Calendar To-Do
          </h1>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#888" }}
          >
            ~80 Years • ~29,200 Days • Make them count.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              htmlFor="squareSize"
              style={{ fontSize: "0.75rem", color: "#888" }}
            >
              Square Size
            </label>
            <input
              id="squareSize"
              type="range"
              min="8"
              max="32"
              step="2"
              value={data.squareSize || 14}
              onChange={(e) => updateSquareSize(Number(e.target.value))}
              style={{ width: "100px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              htmlFor="birthdate"
              style={{ fontSize: "0.75rem", color: "#888" }}
            >
              Birth Date
            </label>
            <input
              id="birthdate"
              type="date"
              value={data.birthDate}
              onChange={(e) => updateBirthDate(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#222",
                color: "#fff",
              }}
            />
          </div>

          <button
            onClick={() => setIsDefaultTasksModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Manage Default Tasks"
          >
            <ListTodo size={18} />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Manage Data"
          >
            <Settings size={18} />
            <span>Data</span>
          </button>
        </div>
      </header>

      {/* Legend / Info Bar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "12px 12px",
          fontSize: "0.85rem",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #333",
          color: "#aaa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#4b5563" }}>■</span> Past (No Status)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#22c55e" }}>■</span> Completed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#ef4444" }}>■</span> Failed / Missed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#d1d5db" }}>□</span> Future
        </div>

        <div style={{ flex: 1 }}></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#888",
          }}
        >
          <Info size={14} /> Drag to select multiple days.
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

      {/* JSON Editor Modal */}
      <JSONModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jsonData={exportData()}
        onImport={importData}
      />
    </div>
  );
}
