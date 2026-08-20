"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createTask, Task, TaskPriority, TaskStatus } from "@/lib/tasks";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { Check, X } from "lucide-react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  projectId: number;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
}: CreateTaskModalProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      router.push("/login");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const task = await createTask(accessToken, {
        project: projectId,
        title,
        description,
        status,
        priority,
        due_date: dueDate,
      });

      onTaskCreated(task);
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create task.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Create task
          </h3>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <ActionButton type="button" onClick={onClose} icon={<X size={16} />} className="flex-1">
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={creating}
              icon={<Check size={16} />}
              variant="primary"
              className="flex-1"
            >
              {creating ? "Creating..." : "Create"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
