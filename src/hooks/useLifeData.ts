import { useState, useEffect, useCallback, useRef } from "react";
import {
  ApiError,
  ApiStatus,
  BootstrapPayload,
  ProblemDetails,
  bootstrapUser,
  getBootstrapState,
} from "../utils/api";

export type DayStatus = "completed" | "failed";
export type SyncStatus = "idle" | "syncing" | "error";

type ApiErrorState = ProblemDetails;

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

export function useLifeData(routeUserId?: string) {
  const [data, setData] = useState<LifeData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(routeUserId || null);
  const [apiError, setApiError] = useState<ApiErrorState | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const lastBootstrapKeyRef = useRef<string | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);

  // If routeUserId changes, update our state
  useEffect(() => {
    if (routeUserId) {
      setUserId(routeUserId);
    }
  }, [routeUserId]);

  // Load from local storage as a fallback, but do NOT set isLoaded yet.
  // We want to block the UI until the GET request completes.
  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
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
    }
  }, [userId]);

  // Save to local storage whenever data changes (offline fallback)
  useEffect(() => {
    if (isLoaded && userId) {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
    }
  }, [data, isLoaded, userId]);

  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      setApiError({
        title: error.title,
        detail: error.detail,
        status: error.status,
        traceId: error.traceId,
      });
      return;
    }

    if (error instanceof Error) {
      setApiError({ title: error.message, detail: null });
      return;
    }

    setApiError({ title: "Unexpected error", detail: null });
  }, []);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const updateName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, name }));
  }, []);

  const updateBirthDate = useCallback((newBirthDate: string) => {
    setData((prev) => {
      const toDateOnly = (value: string) =>
        value?.length >= 10 ? value.slice(0, 10) : value;

      const oldBirthDate = toDateOnly(prev.birthDate || "");
      const nextBirthDate = toDateOnly(newBirthDate || "");

      // Se for a mesma data ou não houver data anterior (setup), apenas atualiza
      if (!oldBirthDate || !nextBirthDate || oldBirthDate === nextBirthDate) {
        return { ...prev, birthDate: nextBirthDate };
      }

      const parseToUtcDay = (dateStr: string): number | null => {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return null;

        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
          return null;
        }

        const utc = Date.UTC(year, month - 1, day);
        if (Number.isNaN(utc)) return null;

        return Math.floor(utc / (1000 * 60 * 60 * 24));
      };

      const oldDayNumber = parseToUtcDay(oldBirthDate);
      const newDayNumber = parseToUtcDay(nextBirthDate);

      // Fallback seguro: se não der para calcular, mantém dados sem deslocar
      if (oldDayNumber === null || newDayNumber === null) {
        return { ...prev, birthDate: nextBirthDate };
      }

      const diffDays = newDayNumber - oldDayNumber;
      if (diffDays === 0) {
        return { ...prev, birthDate: nextBirthDate };
      }

      const shiftIndices = <T>(
        record: Record<number, T>,
      ): Record<number, T> => {
        const shifted: Record<number, T> = {};

        for (const [key, value] of Object.entries(record)) {
          const oldIndex = Number(key);
          if (Number.isNaN(oldIndex)) continue;

          const newIndex = oldIndex - diffDays;
          if (newIndex < 0) continue;

          shifted[newIndex] = value;
        }

        return shifted;
      };

      return {
        ...prev,
        birthDate: nextBirthDate,
        // Preserva tarefas/journal/status, apenas muda o índice do dia
        days: shiftIndices(prev.days),
        statuses: shiftIndices(prev.statuses),
      };
    });
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

  const toApiStatus = useCallback(
    (status?: DayStatus): ApiStatus | undefined => {
      if (!status) return undefined;
      return status === "completed" ? "completed" : "failed";
    },
    [],
  );

  const fromApiStatus = useCallback(
    (status?: ApiStatus | string): DayStatus | undefined => {
      if (!status) return undefined;
      const normalized = String(status).toLowerCase();
      if (normalized === "pending") return undefined;
      return normalized === "completed" ? "completed" : "failed";
    },
    [],
  );

  const normalizeBirthDate = useCallback((value?: string | null): string => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
  }, []);

  const buildBootstrapPayload = useCallback(
    (payloadData: LifeData): BootstrapPayload => {
      const statuses = Object.fromEntries(
        Object.entries(payloadData.statuses || {}).map(([key, value]) => [
          key,
          (value === "completed" ? "completed" : "failed") as ApiStatus,
        ]),
      ) as Record<string, ApiStatus>;

      const days = Object.fromEntries(
        Object.entries(payloadData.days || {})
          .map(([key, value]) => {
            const dayPayload = {
              ...(value.status ? { status: toApiStatus(value.status) } : {}),
              ...(value.journal ? { journal: value.journal } : {}),
              ...(value.tasks && value.tasks.length
                ? {
                    tasks: value.tasks.map((task) => ({
                      id: task.id,
                      text: task.text,
                      completed: task.completed,
                      duration: task.duration,
                    })),
                  }
                : {}),
            };

            return [key, dayPayload];
          })
          .filter(([, value]) => Object.keys(value).length > 0),
      );

      return {
        name: payloadData.name || "",
        birthDate: payloadData.birthDate,
        squareSize: payloadData.squareSize ?? 14,
        showHelp: payloadData.showHelp ?? true,
        setupCompleted: payloadData.setupCompleted ?? false,
        defaultTasks: (payloadData.defaultTasks || []).map((task) => ({
          id: task.id,
          text: task.text,
          completed: false,
          duration: task.duration,
        })),
        statuses,
        days,
      };
    },
    [toApiStatus],
  );

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

  // Pull full bootstrap state from API (multi-device sync)
  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    const loadBootstrapState = async () => {
      try {
        const response = await getBootstrapState(userId);
        if (!isActive || !response) return;

        const mapped: LifeData = {
          name: response.name ?? "",
          birthDate: normalizeBirthDate(response.birthDate),
          squareSize: response.squareSize ?? 14,
          showHelp: response.showHelp ?? true,
          setupCompleted: response.setupCompleted ?? false,
          defaultTasks: (response.defaultTasks || []).map((task) => ({
            id: task.id,
            text: task.text,
            completed: false,
            duration: task.duration,
          })),
          statuses: Object.fromEntries(
            Object.entries(response.statuses || {})
              .map(([key, value]) => [key, fromApiStatus(value)])
              .filter(([, value]) => value),
          ) as Record<number, DayStatus>,
          days: Object.fromEntries(
            Object.entries(response.days || {}).map(([key, value]) => [
              key,
              {
                status: fromApiStatus(value.status),
                journal: value.journal || "",
                tasks: (value.tasks || []).map((task) => ({
                  id: task.id,
                  text: task.text,
                  completed: task.completed ?? false,
                  duration: task.duration,
                })),
              },
            ]),
          ) as Record<number, DayDetails>,
        };

        setData(mapped);
        lastBootstrapKeyRef.current = JSON.stringify(
          buildBootstrapPayload(mapped),
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // Se retornar 404, significa que é um usuário novo que ainda não tem dados.
          // Ignoramos o erro silenciosamente para o usuário fazer o setup inicial.
          console.log("Novo usuário detectado (404). Iniciando setup limpo.");
        } else {
          handleApiError(error);
        }
      } finally {
        if (isActive) {
          setIsLoaded(true); // Allow UI to render only after GET completes
        }
      }
    };

    loadBootstrapState();

    return () => {
      isActive = false;
    };
  }, [
    userId,
    buildBootstrapPayload,
    fromApiStatus,
    handleApiError,
    normalizeBirthDate,
  ]);

  // Persist full app state to API (debounced)
  // NOTE: name/birthDate também são enviados por aqui, evitando corrida entre PUT /users e POST /bootstrap.
  useEffect(() => {
    if (!userId || !isLoaded || !data.birthDate) return;

    const payload = buildBootstrapPayload(data);
    const payloadKey = JSON.stringify(payload);

    if (payloadKey === lastBootstrapKeyRef.current) return;

    if (bootstrapTimerRef.current) {
      window.clearTimeout(bootstrapTimerRef.current);
    }

    bootstrapTimerRef.current = window.setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        await bootstrapUser(userId, payload);
        lastBootstrapKeyRef.current = payloadKey;
        setSyncStatus("idle");
      } catch (error) {
        // Se houver conflito de concorrência (409), recarrega o estado do servidor
        // para evitar loop de erro e manter cliente alinhado ao backend.
        if (error instanceof ApiError && error.status === 409) {
          try {
            const latest = await getBootstrapState(userId);
            if (latest) {
              const mapped: LifeData = {
                name: latest.name ?? "",
                birthDate: normalizeBirthDate(latest.birthDate),
                squareSize: latest.squareSize ?? 14,
                showHelp: latest.showHelp ?? true,
                setupCompleted: latest.setupCompleted ?? false,
                defaultTasks: (latest.defaultTasks || []).map((task) => ({
                  id: task.id,
                  text: task.text,
                  completed: false,
                  duration: task.duration,
                })),
                statuses: Object.fromEntries(
                  Object.entries(latest.statuses || {})
                    .map(([key, value]) => [key, fromApiStatus(value)])
                    .filter(([, value]) => value),
                ) as Record<number, DayStatus>,
                days: Object.fromEntries(
                  Object.entries(latest.days || {}).map(([key, value]) => [
                    key,
                    {
                      status: fromApiStatus(value.status),
                      journal: value.journal || "",
                      tasks: (value.tasks || []).map((task) => ({
                        id: task.id,
                        text: task.text,
                        completed: task.completed ?? false,
                        duration: task.duration,
                      })),
                    },
                  ]),
                ) as Record<number, DayDetails>,
              };

              setData(mapped);
              lastBootstrapKeyRef.current = JSON.stringify(
                buildBootstrapPayload(mapped),
              );
            }
          } catch {
            // Se falhar o reload, mantém o fluxo normal de erro abaixo
          }
        }

        setSyncStatus("error");
        handleApiError(error);
      }
    }, 1500); // 1.5s debounce

    return () => {
      if (bootstrapTimerRef.current) {
        window.clearTimeout(bootstrapTimerRef.current);
        bootstrapTimerRef.current = null;
      }
    };
  }, [userId, isLoaded, data, buildBootstrapPayload, handleApiError]);

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
    userId,
    apiError,
    syncStatus,
    clearApiError,
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
