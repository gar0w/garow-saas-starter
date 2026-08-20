"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Task, TaskPriority, TaskStatus, updateTask } from "@/lib/tasks";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { Check, X } from "lucide-react";

type EditTaskModalProps = {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
};

export function EditTaskModal({ task, onClose, onTaskUpdated }: EditTaskModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!task) return null;

  const currentTask = task;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await updateTask(token, currentTask.id, { title, description, status, priority, due_date: dueDate || undefined });
      onTaskUpdated(updated);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit task</h3>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Due date
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex gap-3">
            <ActionButton type="button" onClick={onClose} icon={<X size={16} />} className="flex-1">Cancel</ActionButton>
            <ActionButton type="submit" disabled={saving} icon={<Check size={16} />} variant="primary" className="flex-1">{saving ? "Saving..." : "Save changes"}</ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
