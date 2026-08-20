"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { deleteTask, getTasks, Task, TaskPriority, TaskStatus } from "@/lib/tasks";
import { deleteProject, Project } from "@/lib/projects";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Panel } from "@/components/ui/Panel";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { ArrowLeft, FolderPlus, Pencil, Trash2 } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [taskSort, setTaskSort] = useState<"created_at" | "-created_at" | "due_date" | "-due_date">("-created_at");

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    const accessToken = storedToken;

    async function loadProject() {
      try {
        const [projectData, tasksData] = await Promise.all([
          apiFetch<Project>(
            `/api/projects/${projectId}/`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
          getTasks(accessToken, projectId),
        ]);

        setProject(projectData);
        setTasks(tasksData);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, router]);

  function handleTaskCreated(task: Task) {
    setTasks((current) => [...current, task]);
  }

  function handleProjectUpdated(updatedProject: Project) {
    setProject(updatedProject);
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((current) =>
      current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  }

  const visibleTasks = tasks
    .filter((task) => taskStatusFilter === "ALL" || task.status === taskStatusFilter)
    .filter((task) => taskPriorityFilter === "ALL" || task.priority === taskPriorityFilter)
    .sort((left, right) => {
      const leftValue = left[taskSort.replace("-", "") as "created_at" | "due_date"] || "";
      const rightValue = right[taskSort.replace("-", "") as "created_at" | "due_date"] || "";
      return taskSort.startsWith("-")
        ? String(rightValue).localeCompare(String(leftValue))
        : String(leftValue).localeCompare(String(rightValue));
    });

  async function handleProjectDeleted() {
    if (!project || !window.confirm(`Delete ${project.name}?`)) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await deleteProject(token, project.id);
      router.push("/dashboard");
    } catch (requestError) {
      window.alert(requestError instanceof Error ? requestError.message : "Unable to delete project.");
    }
  }

  async function handleTaskDeleted(task: Task) {
    if (!window.confirm(`Delete ${task.title}?`)) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await deleteTask(token, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (requestError) {
      window.alert(requestError instanceof Error ? requestError.message : "Unable to delete task.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <ActionButton
          onClick={() => router.push("/dashboard")}
          icon={<ArrowLeft size={16} />}
          className="mb-6"
        >
          Back to projects
        </ActionButton>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{project.name}</h2>
            <p className="mt-2 text-gray-600">{project.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <IconButton icon={<Pencil size={16} />} label="Edit project" text="Edit" onClick={() => setEditingProject(project)} />
            <IconButton icon={<Trash2 size={16} />} label="Delete project" text="Delete" variant="danger" onClick={handleProjectDeleted} />
          </div>
        </div>
      </div>

      <Panel>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Tasks
          </h3>

          <ActionButton
            onClick={() => setIsModalOpen(true)}
            icon={<FolderPlus size={17} />}
            variant="primary"
          >
            New task
          </ActionButton>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <select value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value as TaskStatus | "ALL")} className="rounded-lg border px-3 py-2">
            <option value="ALL">All statuses</option>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
          <select value={taskPriorityFilter} onChange={(event) => setTaskPriorityFilter(event.target.value as TaskPriority | "ALL")} className="rounded-lg border px-3 py-2">
            <option value="ALL">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={taskSort} onChange={(event) => setTaskSort(event.target.value as typeof taskSort)} className="rounded-lg border px-3 py-2">
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="due_date">Due date soonest</option>
            <option value="-due_date">Due date latest</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {visibleTasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tasks yet. Create your first task to get started.
            </p>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {task.title}
                  </h4>

                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-xs font-medium text-gray-500">{task.priority} · {task.status}</span>
                    <IconButton icon={<Pencil size={14} />} label={`Edit ${task.title}`} text="Edit" onClick={() => setEditingTask(task)} />
                    <IconButton icon={<Trash2 size={14} />} label={`Delete ${task.title}`} text="Delete" variant="danger" onClick={() => handleTaskDeleted(task)} />
                  </div>
                </div>

                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                  <p className="mt-2 text-xs text-gray-500">Due {task.due_date}</p>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
      />
      <EditProjectModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onProjectUpdated={handleProjectUpdated}
      />
      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={handleTaskUpdated}
      />
    </DashboardLayout>
  );
}