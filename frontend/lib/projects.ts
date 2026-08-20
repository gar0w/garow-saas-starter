import { apiFetch } from "@/lib/api";

export type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: number;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export async function getProjects(accessToken: string) {
  return apiFetch<Project[]>("/api/projects/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createProject(
  accessToken: string,
  data: {
    name: string;
    description: string;
    status?: ProjectStatus;
  },
) {
  return apiFetch<Project>("/api/projects/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ...data, status: data.status ?? "ACTIVE" }),
  });
}

export async function updateProject(
  accessToken: string,
  projectId: number,
  data: { name: string; description: string; status?: ProjectStatus },
) {
  return apiFetch<Project>(`/api/projects/${projectId}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
}

export async function deleteProject(
  accessToken: string,
  projectId: number,
) {
  return apiFetch<void>(`/api/projects/${projectId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}