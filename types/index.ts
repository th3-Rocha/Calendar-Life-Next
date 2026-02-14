export interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  children?: DriveItem[];
  webViewLink?: string;
}

export interface VideoProgress {
  fileId: string;
  currentTime: number;
  duration: number;
  lastUpdated: number;
  completed: boolean;
}

export interface WatchedVideos {
  [fileId: string]: boolean;
}

export interface VideoMetadata {
  id: string;
  name: string;
  path: string[];
}
