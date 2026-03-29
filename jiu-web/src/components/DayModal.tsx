import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { DayDetails, Task, DayStatus } from "../hooks/useLifeData";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayIndex: number | null;
  birthDate: string;
  details: DayDetails | null;
  defaultTasks: Task[];
  onSave: (dayIndex: number, details: DayDetails) => void;
}

export default function DayModal({
  isOpen,
  onClose,
  dayIndex,
  birthDate,
  details,
  defaultTasks,
  onSave,
}: DayModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journal, setJournal] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState<number | "">("");
  const [status, setStatus] = useState<DayStatus | undefined>(undefined);

  // Sync state when opened
  useEffect(() => {
    if (isOpen && dayIndex !== null) {
      if (!details || !details.tasks) {
        // If no tasks exist for this day, populate with default tasks
        setTasks(
          (defaultTasks || []).map((t) => ({ ...t, id: crypto.randomUUID() })),
        );
      } else {
        setTasks(details.tasks);
      }
      setJournal(details?.journal || "");
      setStatus(details?.status);
      setNewTaskText("");
      setNewTaskDuration("");
    }
  }, [isOpen, dayIndex, details]);

  if (!isOpen || dayIndex === null) return null;

  const date = addDays(new Date(birthDate + "T00:00:00"), dayIndex);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      duration:
        typeof newTaskDuration === "number" ? newTaskDuration : undefined,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
    setNewTaskDuration("");
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    onSave(dayIndex, {
      status,
      tasks,
      journal,
    });
    onClose();
  };

  // Determine auto-status based on tasks completion if desired
  // But let's leave it manual or keep the canvas click-to-cycle logic

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Day {dayIndex + 1}</h2>
            <p style={styles.subtitle}>{format(date, "EEEE, MMMM do, yyyy")}</p>
          </div>
          <button onClick={onClose} style={styles.iconButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Status Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Day Status</h3>
            <div style={styles.statusGroup}>
              <button
                style={{
                  ...styles.statusButton,
                  backgroundColor: status === "completed" ? "#22c55e" : "#222",
                  color: status === "completed" ? "#000" : "#fff",
                }}
                onClick={() => setStatus("completed")}
              >
                Completed
              </button>
              <button
                style={{
                  ...styles.statusButton,
                  backgroundColor: status === "failed" ? "#ef4444" : "#222",
                  color: status === "failed" ? "#000" : "#fff",
                }}
                onClick={() => setStatus("failed")}
              >
                Failed
              </button>
              <button
                style={{
                  ...styles.statusButton,
                  backgroundColor: !status ? "#4b5563" : "#222",
                  color: !status ? "#000" : "#fff",
                }}
                onClick={() => setStatus(undefined)}
              >
                None
              </button>
            </div>
          </div>

          {/* Tasks */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>To-Do List</h3>

            <div style={styles.taskList}>
              {tasks.length === 0 && (
                <p style={styles.emptyText}>No tasks for this day yet.</p>
              )}
              {tasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <label style={styles.taskLabel}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      style={styles.checkbox}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          color: task.completed ? "#888" : "#fff",
                        }}
                      >
                        {task.text}
                      </span>
                      {task.duration && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.75rem",
                            color: "#888",
                          }}
                        >
                          <Clock size={10} /> {task.duration}m
                        </span>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={styles.deleteButton}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} style={styles.taskForm}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                style={{ ...styles.input, flex: 2 }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  padding: "0 8px",
                  flex: 1,
                }}
              >
                <Clock size={16} color="#888" />
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newTaskDuration}
                  onChange={(e) =>
                    setNewTaskDuration(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  placeholder="Min"
                  style={{
                    ...styles.input,
                    border: "none",
                    backgroundColor: "transparent",
                    padding: "10px 8px",
                    width: "100%",
                  }}
                />
              </div>
              <button type="submit" style={styles.addButton}>
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Journal */}
          <div
            style={{
              ...styles.section,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={styles.sectionTitle}>Journal</h3>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Write your thoughts, notes, or attach links here..."
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#111",
    border: "1px solid #333",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "85vh",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "16px",
    borderBottom: "1px solid #222",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#888",
    fontSize: "0.9rem",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
  },
  content: {
    padding: "16px",
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#ddd",
  },
  statusGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  statusButton: {
    flex: 1,
    padding: "10px",
    border: "1px solid #333",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  emptyText: {
    margin: 0,
    color: "#666",
    fontStyle: "italic",
    fontSize: "0.9rem",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #222",
  },
  taskLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    flex: 1,
    fontSize: "0.95rem",
    wordBreak: "break-word",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "4px",
    opacity: 0.8,
  },
  taskForm: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  input: {
    flex: "1 1 100px",
    boxSizing: "border-box",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "0.95rem",
    outline: "none",
  },
  addButton: {
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    padding: "0 16px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textarea: {
    flex: 1,
    minHeight: "120px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    color: "#fff",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "0.95rem",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px",
    borderTop: "1px solid #222",
    backgroundColor: "#0a0a0a",
    borderRadius: "0 0 12px 12px",
  },
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};
