"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Project, ProjectStatus, updateProject } from "@/lib/projects";
import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import { Check, X } from "lucide-react";

type EditProjectModalProps = {
  project: Project | null;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
};

export function EditProjectModal({
  project,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!project) return null;

  const currentProject = project;

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
      const updated = await updateProject(token, currentProject.id, { name, description, status });
      onProjectUpdated(updated);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit project</h3>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
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
