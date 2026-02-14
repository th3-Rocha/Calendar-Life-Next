import { NextResponse } from "next/server";
import { getFolderStructure } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rootFolderId = process.env.NEXT_PUBLIC_DRIVE_ROOT_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Validate all required environment variables
    if (!rootFolderId) {
      console.error("NEXT_PUBLIC_DRIVE_ROOT_ID is not set");
      return NextResponse.json(
        {
          error:
            "Root folder ID not configured. Please set NEXT_PUBLIC_DRIVE_ROOT_ID in .env.local",
        },
        { status: 500 },
      );
    }

    if (!clientEmail) {
      console.error("GOOGLE_CLIENT_EMAIL is not set");
      return NextResponse.json(
        {
          error:
            "Google client email not configured. Please set GOOGLE_CLIENT_EMAIL in .env.local",
        },
        { status: 500 },
      );
    }

    if (!privateKey) {
      console.error("GOOGLE_PRIVATE_KEY is not set");
      return NextResponse.json(
        {
          error:
            "Google private key not configured. Please set GOOGLE_PRIVATE_KEY in .env.local",
        },
        { status: 500 },
      );
    }

    // Check if credentials are still placeholders
    if (
      clientEmail.includes("your-email") ||
      (clientEmail.includes("project.iam.gserviceaccount.com") &&
        clientEmail.startsWith("your-"))
    ) {
      console.error("GOOGLE_CLIENT_EMAIL contains placeholder value");
      return NextResponse.json(
        {
          error:
            "Please replace GOOGLE_CLIENT_EMAIL with your actual service account email in .env.local",
        },
        { status: 500 },
      );
    }

    if (
      privateKey.includes("your-key-here") ||
      privateKey.includes("Your-Key-Here")
    ) {
      console.error("GOOGLE_PRIVATE_KEY contains placeholder value");
      return NextResponse.json(
        {
          error:
            "Please replace GOOGLE_PRIVATE_KEY with your actual private key from the service account JSON in .env.local",
        },
        { status: 500 },
      );
    }

    if (
      rootFolderId.includes("your-folder") ||
      rootFolderId === "your-folder-id"
    ) {
      console.error("NEXT_PUBLIC_DRIVE_ROOT_ID contains placeholder value");
      return NextResponse.json(
        {
          error:
            "Please replace NEXT_PUBLIC_DRIVE_ROOT_ID with your actual Google Drive folder ID in .env.local",
        },
        { status: 500 },
      );
    }

    console.log("Fetching structure for folder:", rootFolderId);
    const structure = await getFolderStructure(rootFolderId);

    return NextResponse.json(structure);
  } catch (error: unknown) {
    const err = error as { message?: string; code?: unknown };
    const message =
      error instanceof Error ? error.message : err.message || "Unknown error";

    console.error("Error fetching folder structure:", error);
    console.error("Error message:", message);
    console.error("Error code:", err.code);

    return NextResponse.json(
      {
        error: "Failed to fetch folder structure",
        details: message,
        hint: "Make sure you have set up Google Service Account correctly and shared the Drive folder with the service account email",
      },
      { status: 500 },
    );
  }
}
