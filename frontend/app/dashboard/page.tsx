"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { deleteProject, getProjects, Project, ProjectStatus } from "@/lib/projects";
import { getTasks, Task } from "@/lib/tasks";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Panel } from "@/components/ui/Panel";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"created_at" | "-created_at" | "name" | "-name">("-created_at");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const token = accessToken;

    async function loadDashboard() {
      try {
        const [userData, projectsData, tasksData] = await Promise.all([
          apiFetch<User>("/api/auth/me/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          getProjects(token),
          getTasks(token),
        ]);

        setUser(userData);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleProjectCreated(project: Project) {
    setProjects((current) => [...current, project]);
  }

  const filteredProjects = projects
    .filter((project) => statusFilter === "ALL" || project.status === statusFilter)
    .filter((project) => project.name.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => {
      if (sort === "name" || sort === "-name") {
        return sort === "name"
          ? left.name.localeCompare(right.name)
          : right.name.localeCompare(left.name);
      }

      const leftDate = new Date(left.created_at).getTime();
      const rightDate = new Date(right.created_at).getTime();
      return sort === "created_at" ? leftDate - rightDate : rightDate - leftDate;
    });

  const today = new Date().toISOString().slice(0, 10);
  const pendingTasks = tasks.filter((task) => task.status !== "DONE");
  const overdueTasks = pendingTasks.filter((task) => task.due_date && task.due_date < today);

  function handleProjectUpdated(project: Project) {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
  }

  async function handleProjectDeleted(project: Project) {
    if (!window.confirm(`Delete ${project.name}?`)) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await deleteProject(token, project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (requestError) {
      window.alert(requestError instanceof Error ? requestError.message : "Unable to delete project.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <DashboardLayout username={user?.username}>
      <div className="mb-10">
        <h2 className="text-3xl font-bold">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Manage your projects and tasks.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Projects", projects.length],
          ["Active projects", projects.filter((project) => project.status === "ACTIVE").length],
          ["Pending tasks", pendingTasks.length],
          ["Overdue tasks", overdueTasks.length],
        ].map(([label, value]) => (
          <Panel key={label} className="p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">
            Your projects
          </h3>

          <ActionButton
            onClick={() => setIsModalOpen(true)}
            icon={<FolderPlus size={17} strokeWidth={2} />}
            variant="primary"
          >
            New project
          </ActionButton>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects"
            className="rounded-lg border px-3 py-2"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | "ALL")} className="rounded-lg border px-3 py-2">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border px-3 py-2">
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-gray-500">
              {projects.length === 0 ? "No projects yet. Create your first project to get started." : "No projects match your filters."}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Panel key={project.id}>
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/dashboard/projects/${project.id}`} className="min-w-0 flex-1">
                      <h4 className="font-semibold hover:underline">{project.name}</h4>
                      <p className="mt-2 text-sm text-gray-600">{project.description || "No description"}</p>
                      <span className="mt-3 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{project.status}</span>
                    </Link>
                    <div className="flex shrink-0 gap-2 pl-2">
                      <IconButton
                        icon={<Pencil size={16} />}
                        label={`Edit ${project.name}`}
                        text="Edit"
                        onClick={() => setEditingProject(project)}
                      />
                      <IconButton
                        icon={<Trash2 size={16} />}
                        label={`Delete ${project.name}`}
                        text="Delete"
                        variant="danger"
                        onClick={() => handleProjectDeleted(project)}
                      />
                    </div>
                  </div>
              </Panel>
            ))
          )}
        </div>
      </Panel>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      <EditProjectModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onProjectUpdated={handleProjectUpdated}
      />
    </DashboardLayout>
  );
}