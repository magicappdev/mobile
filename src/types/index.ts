/**
 * Type definitions for MagicAppDev
 */

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
};

export type AiMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "active" | "archived" | "deployed";
  config: Record<string, unknown>;
  githubUrl?: string;
  deploymentUrl?: string;
  createdAt: string;
  updatedAt: string;
};
