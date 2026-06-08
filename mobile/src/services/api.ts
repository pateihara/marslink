//src/services/api.ts
import {
  CommunicationWindow,
  LoginResponse,
  Message,
  MissionLog,
  Task,
  UploadImageResponse,
  User,
} from "@/src/types/api";

export const API_URL = "https://marslink-backend.vercel.app";

async function request<T>(
  path: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro na requisição.");
  }

  return data as T;
}

export async function login(params: {
  email: string;
  password: string;
  missionCode: string;
}) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getMessages(token: string) {
  return request<Message[]>("/api/messages", undefined, token);
}

export async function createMessage(
  token: string,
  data: {
    content: string;
    priority: string;
  },
) {
  return request<Message>(
    "/api/messages",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function getTasks(token: string) {
  return request<Task[]>("/api/tasks", undefined, token);
}

export async function updateTask(
  token: string,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDay?: number | null;
    assigneeId?: string | null;
    imageUrl?: string | null;
  },
) {
  return request<Task>(
    `/api/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function updateTaskStatus(
  token: string,
  taskId: string,
  status: string,
) {
  return updateTask(token, taskId, { status });
}

export async function updateTaskImage(
  token: string,
  taskId: string,
  imageUrl: string | null,
) {
  return updateTask(token, taskId, { imageUrl });
}

export async function getCrew(token: string) {
  return request<User[]>("/api/crew", undefined, token);
}

export async function getCurrentWindow(token: string) {
  return request<CommunicationWindow>("/api/windows/current", undefined, token);
}

export async function getLogs(token: string) {
  return request<MissionLog[]>("/api/logs", undefined, token);
}

export async function createLog(
  token: string,
  data: {
    title: string;
    content: string;
    mood: string;
    imageUrl?: string | null;
  },
) {
  return request<MissionLog>(
    "/api/logs",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function uploadMissionImage(
  token: string,
  image: {
    uri: string;
    name: string;
    type: string;
  },
) {
  const formData = new FormData();

  formData.append("file", {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/api/upload/mission-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao enviar imagem.");
  }

  return data as UploadImageResponse;
}
