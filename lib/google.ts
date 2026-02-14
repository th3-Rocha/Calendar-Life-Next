import { google } from "googleapis";
import { unstable_cache } from "next/cache";

export interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType?: string;
  children?: DriveItem[];
  size?: string;
  thumbnailLink?: string;
}

const beltOrder = [
  "faixa branca",
  "faixa azul",
  "faixa roxa",
  "faixa marrom",
  "faixa preta",
];

function getBeltRank(name: string | null | undefined): number {
  const normalized = (name ?? "").toLowerCase();
  const idx = beltOrder.findIndex((belt) => normalized.includes(belt));
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function sortDriveItems(
  a: { name?: string | null; mimeType?: string | null },
  b: { name?: string | null; mimeType?: string | null },
) {
  const aIsFolder = a.mimeType === "application/vnd.google-apps.folder";
  const bIsFolder = b.mimeType === "application/vnd.google-apps.folder";

  if (aIsFolder && bIsFolder) {
    const aRank = getBeltRank(a.name || "");
    const bRank = getBeltRank(b.name || "");
    if (aRank !== bRank) return aRank - bRank;
    return (a.name || "").localeCompare(b.name || "", "pt-BR", {
      sensitivity: "base",
    });
  }

  if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

  return (a.name || "").localeCompare(b.name || "", "pt-BR", {
    sensitivity: "base",
  });
}

// Initialize Google Drive API with Service Account
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

// Recursive function to fetch folder structure
async function fetchFolderStructure(folderId: string): Promise<DriveItem[]> {
  const drive = getDriveClient();
  const items: DriveItem[] = [];

  console.log(`[fetchFolderStructure] Fetching folder: ${folderId}`);

  try {
    // Fetch all items in the current folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, size, thumbnailLink)",
      orderBy: "name",
      pageSize: 1000,
    });

    const files = response.data.files || [];
    files.sort(sortDriveItems);
    console.log(
      `[fetchFolderStructure] Found ${files.length} items in folder ${folderId}`,
    );

    for (const file of files) {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      const isVideo = file.mimeType?.startsWith("video/");

      console.log(
        `[fetchFolderStructure] Processing: ${file.name} (${file.mimeType}) - isFolder: ${isFolder}, isVideo: ${isVideo}`,
      );

      // Only include folders and video files
      if (isFolder || isVideo) {
        const item: DriveItem = {
          id: file.id!,
          name: file.name!,
          type: isFolder ? "folder" : "file",
          mimeType: file.mimeType!,
          size: file.size || undefined,
          thumbnailLink: file.thumbnailLink || undefined,
        };

        // Recursively fetch children if it's a folder
        if (isFolder) {
          console.log(
            `[fetchFolderStructure] Recursively fetching children for folder: ${file.name}`,
          );
          item.children = await fetchFolderStructure(file.id!);
          console.log(
            `[fetchFolderStructure] Folder ${file.name} has ${item.children?.length || 0} children`,
          );
        }

        items.push(item);
        console.log(`[fetchFolderStructure] Added item: ${file.name}`);
      } else {
        console.log(
          `[fetchFolderStructure] Skipping non-video/non-folder: ${file.name}`,
        );
      }
    }

    console.log(
      `[fetchFolderStructure] Returning ${items.length} items for folder ${folderId}`,
    );
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      code?: number;
      errors?: unknown;
      stack?: string;
    };
    console.error(`Error fetching folder ${folderId}:`, error);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      errors: err.errors,
      stack: err.stack,
    });
    throw new Error(
      `Failed to fetch folder structure from Google Drive: ${err.message || "Unknown error"}`,
    );
  }

  return items;
}

// Cached version of the folder structure fetch
// Revalidates every hour (3600 seconds)
export const getFolderStructure = unstable_cache(
  async (rootFolderId: string) => {
    console.log(
      "[getFolderStructure] Starting fetch for root folder:",
      rootFolderId,
    );
    const structure = await fetchFolderStructure(rootFolderId);
    console.log(
      "[getFolderStructure] Finished fetch. Total items:",
      structure.length,
    );
    console.log(
      "[getFolderStructure] Structure:",
      JSON.stringify(structure, null, 2),
    );
    return structure;
  },
  ["drive-structure"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["drive-structure"],
  },
);

// Get file metadata and download stream
export async function getFileStream(fileId: string, range?: string) {
  const drive = getDriveClient();

  try {
    // Get file metadata first
    const metadata = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });

    const fileSize = parseInt(metadata.data.size || "0", 10);

    // Parse range header if provided
    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    // Get file stream with range
    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "stream",
        headers: range ? { Range: `bytes=${start}-${end}` } : {},
      },
    );

    return {
      stream: response.data,
      metadata: metadata.data,
      fileSize,
      start,
      end,
      contentLength: end - start + 1,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number };
    console.error(`Error streaming file ${fileId}:`, error);
    console.error("Stream error details:", {
      message: err.message,
      code: err.code,
    });
    throw new Error(
      `Failed to stream file from Google Drive: ${err.message || "Unknown error"}`,
    );
  }
}

// Helper function to flatten the tree structure for navigation
export function flattenDriveItems(items: DriveItem[]): DriveItem[] {
  const flattened: DriveItem[] = [];

  function traverse(items: DriveItem[]) {
    for (const item of items) {
      if (item.type === "file") {
        flattened.push(item);
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  traverse(items);
  return flattened;
}

// Find next video in the structure
export function findNextVideo(
  items: DriveItem[],
  currentVideoId: string,
): DriveItem | null {
  const flattened = flattenDriveItems(items);
  const currentIndex = flattened.findIndex(
    (item) => item.id === currentVideoId,
  );

  if (currentIndex === -1 || currentIndex === flattened.length - 1) {
    return null;
  }

  return flattened[currentIndex + 1];
}

// Find video by ID in the tree
export function findVideoById(
  items: DriveItem[],
  videoId: string,
): DriveItem | null {
  for (const item of items) {
    if (item.id === videoId) {
      return item;
    }
    if (item.children) {
      const found = findVideoById(item.children, videoId);
      if (found) return found;
    }
  }
  return null;
}
