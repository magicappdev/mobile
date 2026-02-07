/**
 * API Client for MagicAppDev Ionic
 *
 * Handles all API communication with the backend.
 * Compatible with browser environment (fetch API).
 */

import type { AiMessage, Project, User } from "../types";

interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

interface ApiErrorData {
  error?:
    | {
        message?: string;
      }
    | string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClient {
  baseUrl: string;
  accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.accessToken = token;
  }

  async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    console.log("[API] Requesting: %s %s", options.method || "GET", url);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(
        "[API] Response: %d %s",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorData;
        const message =
          (typeof errorData.error === "object"
            ? errorData.error?.message
            : undefined) ||
          (typeof errorData.error === "string" ? errorData.error : undefined) ||
          `API Request failed: ${response.statusText}`;
        throw new Error(message);
      }

      return response.json() as Promise<unknown>;
    } catch (e) {
      console.error("[API] Request Error for %s:", url, e);
      throw e;
    }
  }

  getGitHubLoginUrl(platform = "web") {
    return `${this.baseUrl}/auth/login/github?platform=${platform}`;
  }

  getDiscordLoginUrl(platform = "web") {
    return `${this.baseUrl}/auth/login/discord?platform=${platform}`;
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  register(data: unknown) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(refreshToken: string) {
    await this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    this.setToken(null);
  }

  async refresh(refreshToken: string) {
    const response = (await this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })) as ApiResponse<{ accessToken: string }>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
    this.setToken(response.data.accessToken);
    return response.data.accessToken;
  }

  async getCurrentUser(): Promise<User> {
    const response = (await this.request("/auth/me")) as ApiResponse<User>;
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to fetch user profile",
      );
    }
    return response.data;
  }

  async getProjects(): Promise<Project[]> {
    const response = (await this.request("/projects")) as ApiResponse<{
      data: Project[];
    }>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = (await this.request(
      `/projects/${id}`,
    )) as ApiResponse<Project>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async createProject(data: Record<string, unknown>): Promise<Project> {
    const response = (await this.request("/projects", {
      method: "POST",
      body: JSON.stringify({ ...data, config: {} }),
    })) as ApiResponse<Project>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async deleteProject(id: string) {
    const response = (await this.request(`/projects/${id}`, {
      method: "DELETE",
    })) as ApiErrorResponse | ApiSuccessResponse<unknown>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async sendMessage(messages: AiMessage[]): Promise<string> {
    const response = (await this.request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    })) as ApiResponse<{ message: string }>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data.message;
  }

  async changePassword(data: unknown) {
    const response = (await this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })) as ApiErrorResponse | ApiSuccessResponse<unknown>;
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async getLinkAccountUrl(provider: string) {
    return `${this.baseUrl}/auth/link/${provider}${this.accessToken ? `?token=${this.accessToken}` : ""}`;
  }

  // Check if OAuth session is complete (for mobile polling)
  async checkOAuthSession(sessionId: string): Promise<{
    success: boolean;
    pending?: boolean;
    data?: { accessToken: string; refreshToken: string };
  }> {
    const response = await fetch(
      `${this.baseUrl}/auth/check-session?sessionId=${sessionId}`,
    );
    return response.json();
  }

  /**
   * Stream chat messages using Server-Sent Events (SSE)
   */
  async *streamMessage(
    messages: AiMessage[],
  ): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}/ai/chat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body to read");
    }

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let eventEndIndex;
      while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);
        const lines = rawEvent.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                yield parsed.response;
              }
            } catch (e) {
              console.warn("Failed to parse SSE data chunk", e);
            }
          }
        }
      }
    }
  }
}

const API_URL = "https://magicappdev-api.magicappdev.workers.dev";
export const CHAT_API_URL =
  "https://magicappdev-llmchat.magicappdev.workers.dev";
export const AGENT_HOST = "magicappdev-agent-minimal.magicappdev.workers.dev";

export const api = new ApiClient(API_URL);
