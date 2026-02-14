import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Flatten the nested folder structure into a linear array of files
 */
export interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: DriveItem[];
}

export function flattenFiles(items: DriveItem[]): DriveItem[] {
  const files: DriveItem[] = [];

  function traverse(items: DriveItem[]) {
    for (const item of items) {
      if (item.type === "file") {
        files.push(item);
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  traverse(items);
  return files;
}

/**
 * Find the next video in the flattened list
 */
export function getNextVideo(
  currentFileId: string,
  structure: DriveItem[]
): DriveItem | null {
  const files = flattenFiles(structure);
  const currentIndex = files.findIndex((f) => f.id === currentFileId);

  if (currentIndex === -1 || currentIndex === files.length - 1) {
    return null;
  }

  return files[currentIndex + 1];
}

/**
 * Find the previous video in the flattened list
 */
export function getPreviousVideo(
  currentFileId: string,
  structure: DriveItem[]
): DriveItem | null {
  const files = flattenFiles(structure);
  const currentIndex = files.findIndex((f) => f.id === currentFileId);

  if (currentIndex <= 0) {
    return null;
  }

  return files[currentIndex - 1];
}

/**
 * Local Storage helpers for video progress
 */
export const storage = {
  getProgress: (fileId: string): number => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(`video_progress_${fileId}`);
    return saved ? parseFloat(saved) : 0;
  },

  setProgress: (fileId: string, time: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`video_progress_${fileId}`, time.toString());
  },

  isCompleted: (fileId: string): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`video_completed_${fileId}`) === "true";
  },

  setCompleted: (fileId: string, completed: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`video_completed_${fileId}`, completed.toString());
  },

  clearProgress: (fileId: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`video_progress_${fileId}`);
    localStorage.removeItem(`video_completed_${fileId}`);
  },
};

/**
 * Format time in seconds to HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
