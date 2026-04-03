import { useState, useEffect, useCallback } from "react";

export type DayStatus = "completed" | "failed";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  duration?: number; // Duration in minutes (1-90)
}

export interface DayDetails {
  status?: DayStatus;
  tasks?: Task[];
  journal?: string;
}

export interface LifeData {
  name?: string; // User's name
  birthDate: string; // YYYY-MM-DD format
  statuses: Record<number, DayStatus>; // Map of day index to status (legacy)
  days: Record<number, DayDetails>; // Map of day index to detailed info
  squareSize?: number; // Size of the canvas squares
  defaultTasks?: Task[]; // List of default daily tasks
  showHelp?: boolean;
  setupCompleted?: boolean; // Whether to show the legend/help bar
}

const DEFAULT_DATA: LifeData = {
  name: "",
  birthDate: "",
  statuses: {},
  days: {},
  squareSize: 14,
  defaultTasks: [],
  showHelp: true,
  setupCompleted: false,
};

const STORAGE_KEY = "life_calendar_data";

export function useLifeData() {
  const [data, setData] = useState<LifeData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        
        const parsed = JSON.parse(stored);
        if (parsed.setupCompleted === undefined && parsed.birthDate) {
          parsed.setupCompleted = true;
        }
        setData(parsed);

      }
    } catch (error) {
      console.error(
        "Failed to parse life calendar data from localStorage:",
        error,
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, name }));
  }, []);

  const updateBirthDate = useCallback((birthDate: string) => {
    setData((prev) => ({ ...prev, birthDate }));
  }, []);

  const updateSquareSize = useCallback((squareSize: number) => {
    setData((prev) => ({ ...prev, squareSize }));
  }, []);

  const updateDefaultTasks = useCallback((defaultTasks: Task[]) => {
    setData((prev) => ({ ...prev, defaultTasks }));
  }, []);

  const updateShowHelp = useCallback((showHelp: boolean) => {
    setData((prev) => ({ ...prev, showHelp }));
  }, []);

  const completeSetup = useCallback((name: string, birthDate: string) => {
    setData((prev) => ({ ...prev, name, birthDate, setupCompleted: true }));
  }, []);

  const updateStatuses = useCallback(
    (dayIndices: number[], status: DayStatus | null) => {
      setData((prev) => {
        const newStatuses = { ...prev.statuses };
        const newDays = { ...prev.days };

        for (const index of dayIndices) {
          // Keep legacy statuses updated just in case, but prefer `days` going forward
          if (status === null) {
            delete newStatuses[index];
            if (newDays[index]) {
              newDays[index] = { ...newDays[index], status: undefined };
              // Clean up empty day objects
              if (
                !newDays[index].tasks?.length &&
                !newDays[index].journal &&
                !newDays[index].status
              ) {
                delete newDays[index];
              }
            }
          } else {
            newStatuses[index] = status;
            newDays[index] = { ...newDays[index], status };
          }
        }

        return { ...prev, statuses: newStatuses, days: newDays };
      });
    },
    [],
  );

  const updateDayDetails = useCallback(
    (dayIndex: number, details: DayDetails) => {
      setData((prev) => {
        const newDays = { ...prev.days };

        // Merge with existing details if any
        newDays[dayIndex] = { ...newDays[dayIndex], ...details };

        // Clean up empty objects
        if (
          !newDays[dayIndex].status &&
          !newDays[dayIndex].tasks?.length &&
          !newDays[dayIndex].journal
        ) {
          delete newDays[dayIndex];
        }

        // Keep legacy statuses in sync for rendering
        const newStatuses = { ...prev.statuses };
        if (newDays[dayIndex]?.status) {
          newStatuses[dayIndex] = newDays[dayIndex].status as DayStatus;
        } else {
          delete newStatuses[dayIndex];
        }

        return { ...prev, days: newDays, statuses: newStatuses };
      });
    },
    [],
  );

  const importData = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.birthDate === "string") {
        // Ensure days object exists for backward compatibility
        if (!parsed.days) parsed.days = {};
        if (!parsed.statuses) parsed.statuses = {};

        setData(parsed);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  return {
    data,
    isLoaded,
    updateName,
    updateBirthDate,
    updateSquareSize,
    updateDefaultTasks,
    updateShowHelp,
    completeSetup,
    updateStatuses,
    updateDayDetails,
    importData,
    exportData,
  };
}
