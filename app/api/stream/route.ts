import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

const drive = google.drive("v3");

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return auth;
}

export async function GET(request: NextRequest) {
  try {
    // Security check - verify authentication cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("site_auth");

    if (!authCookie || authCookie.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId parameter" },
        { status: 400 },
      );
    }

    const auth = await getAuth();

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      auth,
      fileId: fileId,
      fields: "size, mimeType, name",
    });

    const fileSize = parseInt(fileMetadata.data.size || "0");
    const mimeType = fileMetadata.data.mimeType || "video/mp4";

    // Parse Range header
    const range = request.headers.get("range");

    if (!range) {
      // No range requested - stream entire file
      const response = await drive.files.get(
        {
          auth,
          fileId: fileId,
          alt: "media",
        },
        { responseType: "stream" },
      );

      const stream = response.data as NodeJS.ReadableStream;

      // Convert Node.js stream to Web ReadableStream
      const readableStream = new ReadableStream({
        async start(controller) {
          stream.on("data", (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          stream.on("end", () => {
            controller.close();
          });
          stream.on("error", (error: Error) => {
            controller.error(error);
          });
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": fileSize.toString(),
          "Accept-Ranges": "bytes",
        },
      });
    }

    // Handle Range request (HTTP 206 Partial Content)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    // Request the specific byte range from Google Drive
    const response = await drive.files.get(
      {
        auth,
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "stream",
        headers: {
          Range: `bytes=${start}-${end}`,
        },
      },
    );

    const stream = response.data as NodeJS.ReadableStream;

    // Convert Node.js stream to Web ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        stream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        stream.on("end", () => {
          controller.close();
        });
        stream.on("error", (error: Error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(readableStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    const err = error as { code?: number; message?: string };

    // Handle specific Google Drive errors
    if (err.code === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (err.code === 403) {
      return NextResponse.json(
        { error: "Access denied to file" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: err.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
