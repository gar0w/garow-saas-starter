import { apiFetch } from "@/lib/api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: number;
  project: number;
  created_by: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function getTasks(
  accessToken: string,
  projectId?: number,
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    ordering?: "created_at" | "-created_at" | "due_date" | "-due_date" | "title" | "-title";
  } = {},
) {
  const params = new URLSearchParams();

  if (projectId) params.set("project", String(projectId));
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.ordering) params.set("ordering", filters.ordering);

  const query = params.toString();

  return apiFetch<Task[]>(`${"/api/tasks/"}${query ? `?${query}` : ""}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
  });
}

export async function createTask(
  accessToken: string,
  data: {
    project: number;
    title: string;
    description: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
  },
) {
  return apiFetch<Task>("/api/tasks/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...data,
      status: data.status ?? "TODO",
      priority: data.priority ?? "MEDIUM",
      due_date: data.due_date || null,
    }),
  });
}

export async function updateTask(
  accessToken: string,
  taskId: number,
  data: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "due_date">>,
) {
  return apiFetch<Task>(`/api/tasks/${taskId}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
}

export async function deleteTask(
  accessToken: string,
  taskId: number,
) {
  return apiFetch<void>(`/api/tasks/${taskId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}