const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function clearTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

function getErrorMessage(data: unknown, status: number) {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = data.detail;

    if (typeof detail === "string") return detail;
  }

  if (status === 401) return "Your session has expired.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "The requested resource was not found.";
  if (status >= 500) return "The server is unavailable. Try again later.";

  return "The request could not be completed.";
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  return response.json();
}

async function refreshAccessToken() {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await parseResponse(response);

  if (!response.ok || !data || typeof data !== "object" || !("access" in data)) {
    clearTokens();
    return null;
  }

  localStorage.setItem("access_token", data.access as string);

  if ("refresh" in data && typeof data.refresh === "string") {
    localStorage.setItem("refresh_token", data.refresh);
  }

  return data.access as string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && allowRefresh && endpoint !== "/api/auth/refresh/") {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return apiFetch<T>(
        endpoint,
        {
          ...options,
          headers: {
            ...Object.fromEntries(headers.entries()),
            Authorization: `Bearer ${refreshedToken}`,
          },
        },
        false,
      );
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(data, response.status),
      data,
    );
  }

  return data as T;
}

export async function logoutSession() {
  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;

  if (refreshToken) {
    try {
      await apiFetch<void>("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      }, false);
    } catch {
      // Tokens are cleared locally even if the server is unavailable.
    }
  }

  clearTokens();
}
