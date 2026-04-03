import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Clock } from "lucide-react";
import { Task } from "../hooks/useLifeData";

interface DefaultTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTasks: Task[];
  onSave: (tasks: Task[]) => void;
}

export default function DefaultTasksModal({
  isOpen,
  onClose,
  defaultTasks,
  onSave,
}: DefaultTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) {
      // Clone so we don't mutate external state directly
      setTasks((defaultTasks || []).map((t) => ({ ...t, completed: false })));
      setNewTaskText("");
      setNewTaskDuration("");
    }
  }, [isOpen, defaultTasks]);

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false, // Default tasks are never "completed" in the template
      duration:
        typeof newTaskDuration === "number" ? newTaskDuration : undefined,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
    setNewTaskDuration("");
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    // Ensure all saved default tasks have completed: false
    const cleanTasks = tasks.map((t) => ({ ...t, completed: false }));
    onSave(cleanTasks);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Daily Default Tasks</h2>
            <p style={styles.subtitle}>
              These tasks will be automatically added to any new day you click
              on.
            </p>
          </div>
          <button onClick={onClose} style={styles.iconButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.taskList}>
            {tasks.length === 0 && (
              <p style={styles.emptyText}>No default tasks defined.</p>
            )}
            {tasks.map((task) => (
              <div key={task.id} style={styles.taskItem}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={styles.taskText}>{task.text}</span>
                  {task.duration && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.8rem",
                        color: "#888",
                        backgroundColor: "#222",
                        padding: "2px 6px",
                        borderRadius: "10px",
                      }}
                    >
                      <Clock size={12} /> {task.duration}m
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={styles.deleteButton}
                  title="Remove default task"
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
              placeholder="E.g., Read 10 pages, Drink 2L water..."
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

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            <Save size={18} />
            Save Defaults
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
    display: "flex",
    boxSizing: "border-box",
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
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#888",
    fontSize: "0.85rem",
    lineHeight: "1.4",
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
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "300px",
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
  taskText: {
    fontSize: "0.95rem",
    color: "#fff",
    wordBreak: "break-word",
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
