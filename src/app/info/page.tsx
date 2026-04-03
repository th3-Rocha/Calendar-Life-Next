"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Download, Upload, Copy } from "lucide-react";
import { useLifeData } from "../../hooks/useLifeData";

export default function InfoPage() {
  const {
    data,
    isLoaded,
    updateName,
    updateBirthDate,
    importData,
    exportData,
  } = useLifeData();

  const [localJson, setLocalJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setLocalJson(exportData());
    }
  }, [isLoaded, exportData]);

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#fff",
        }}
      >
        Loading Settings...
      </div>
    );
  }

  const handleSaveJson = () => {
    const isSuccess = importData(localJson);
    if (isSuccess) {
      setError(null);
      setSuccess("Data imported and applied successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("Invalid JSON format or missing required fields.");
      setSuccess(null);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "life-calendar-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localJson);
    setSuccess("JSON copied to clipboard!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLocalJson(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid #222",
            paddingBottom: "20px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#888",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
            title="Back to Life Calendar"
          >
            <ArrowLeft size={28} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>
              Settings & Info
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#888" }}>
              Manage your personal profile and raw calendar data
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div
          style={{
            backgroundColor: "#111",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #222",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.25rem",
              borderBottom: "1px solid #222",
              paddingBottom: "12px",
            }}
          >
            Personal Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "#aaa" }}>
                Your Name
              </label>
              <input
                type="text"
                value={data.name || ""}
                onChange={(e) => updateName(e.target.value)}
                placeholder="E.g. John Doe"
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#666")}
                onBlur={(e) => (e.target.style.borderColor = "#333")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "#aaa" }}>
                Birth Date
              </label>
              <input
                type="date"
                value={data.birthDate}
                onChange={(e) => updateBirthDate(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  colorScheme: "dark",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#666")}
                onBlur={(e) => (e.target.style.borderColor = "#333")}
              />
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
              Changes to your profile are saved automatically. Return to the main page to see them applied.
            </p>
          </div>
        </div>

        {/* Data Management Section */}
        <div
          style={{
            backgroundColor: "#111",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                borderBottom: "1px solid #222",
                paddingBottom: "12px",
              }}
            >
              Data Management (JSON)
            </h2>
            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "0.9rem",
                color: "#888",
                lineHeight: "1.5",
              }}
            >
              This is your raw Life Calendar data. Everything is stored locally in your browser. You can copy it to back it up somewhere safe, or paste a backup here and hit "Apply JSON Changes" to restore it.
            </p>
          </div>

          <textarea
            value={localJson}
            onChange={(e) => setLocalJson(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              height: "300px",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              padding: "16px",
              border: "1px solid #333",
              backgroundColor: "#000",
              color: "#4ade80", // Hacker green
              borderRadius: "6px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.9rem",
                padding: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "6px",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                color: "#22c55e",
                fontSize: "0.9rem",
                padding: "12px",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderRadius: "6px",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              {success}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <label style={buttonSecondary}>
                <Upload size={16} /> Upload File
                <input
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={handleDownload}
                style={buttonSecondary}
                title="Download JSON to file"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={handleCopy}
                style={buttonSecondary}
                title="Copy JSON text"
              >
                <Copy size={16} /> Copy
              </button>
            </div>

            <button onClick={handleSaveJson} style={buttonPrimary}>
              <Save size={16} /> Apply JSON Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const buttonPrimary: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  backgroundColor: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "bold",
  transition: "background 0.2s",
};

const buttonSecondary: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  backgroundColor: "transparent",
  color: "#ddd",
  border: "1px solid #444",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "600",
  transition: "all 0.2s",
};
