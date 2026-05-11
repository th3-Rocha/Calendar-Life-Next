export type ProblemDetails = {
  title: string;
  status?: number;
  detail?: string | null;
  traceId?: string;
};

export type UserResponse = {
  id: string;
  name?: string | null;
  birthDate?: string | null;
};

export type ApiStatus = "pending" | "completed" | "failed";

export type ApiTask = {
  id: string;
  text: string;
  completed?: boolean;
  duration?: number;
  status?: ApiStatus;
};

export type ApiDayDetails = {
  status?: ApiStatus;
  journal?: string;
  tasks?: ApiTask[];
};

export type BootstrapStateResponse = {
  userId: string;
  name?: string | null;
  birthDate: string;
  squareSize: number;
  showHelp: boolean;
  setupCompleted: boolean;
  defaultTasks: ApiTask[];
  statuses: Record<string, ApiStatus>;
  days: Record<string, ApiDayDetails>;
};

export type BootstrapPayload = {
  name?: string;
  birthDate: string;
  squareSize: number;
  showHelp: boolean;
  setupCompleted: boolean;
  defaultTasks: ApiTask[];
  statuses: Record<string, ApiStatus>;
  days: Record<string, ApiDayDetails>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5209";

export class ApiError extends Error {
  title: string;
  detail: string | null;
  status?: number;
  traceId?: string;

  constructor(
    title: string,
    detail: string | null,
    status?: number,
    traceId?: string,
  ) {
    super(title);
    this.title = title;
    this.detail = detail;
    this.status = status;
    this.traceId = traceId;
  }
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const body = await parseJsonSafely(response);

  if (!response.ok) {
    if (body && typeof body === "object") {
      const problem = body as ProblemDetails;
      throw new ApiError(
        problem.title || "Request failed",
        problem.detail ?? null,
        response.status,
        problem.traceId,
      );
    }
    throw new ApiError("Request failed", null, response.status);
  }

  return body as T | null;
}

export async function getUser(userId: string): Promise<UserResponse | null> {
  return requestJson<UserResponse>(`/users/${userId}`, {
    method: "GET",
  });
}

export async function updateUser(
  userId: string,
  body: { name?: string; birthDate?: string },
): Promise<UserResponse | null> {
  return requestJson<UserResponse>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

export async function getBootstrapState(
  userId: string,
): Promise<BootstrapStateResponse | null> {
  return requestJson<BootstrapStateResponse>(`/users/${userId}/bootstrap`, {
    method: "GET",
  });
}

export async function bootstrapUser(
  userId: string,
  payload: BootstrapPayload,
): Promise<void> {
  await requestJson<void>(`/users/${userId}/bootstrap`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
