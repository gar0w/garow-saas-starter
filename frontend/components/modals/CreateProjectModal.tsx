"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createProject, Project, ProjectStatus } from "@/lib/projects";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { Check, X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
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
      const project = await createProject(accessToken, {
        name,
        description,
        status,
      });

      onProjectCreated(project);
      setName("");
      setDescription("");
      setStatus("ACTIVE");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create project.",
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
            Create project
          </h3>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>

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
