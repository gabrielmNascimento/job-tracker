import { useRef, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useDeleteResume, useResumes, useUploadResume } from '../lib/useResumes';
import { Modal } from './Modal';

const ACCEPTED_TYPES = '.pdf,.doc,.docx';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumesModal({ onClose }: { onClose: () => void }) {
  const { data: resumes = [], isLoading } = useResumes();
  const uploadResume = useUploadResume();
  const deleteResume = useDeleteResume();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large — max 5 MB.');
      return;
    }
    try {
      await uploadResume.mutateAsync(file);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDownload(id: string, filename: string) {
    try {
      await api.downloadResume(id, filename);
    } catch {
      setError('Download failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this resume? Any applications using it will keep working, just without it attached.')) return;
    await deleteResume.mutateAsync(id);
  }

  return (
    <Modal title="Resumes" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload PDF or Word resumes (max 5 MB, up to 10 files) to attach to your applications.
        </p>

        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : resumes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No resumes uploaded yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {resumes.map((resume) => (
              <li
                key={resume.id}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{resume.filename}</p>
                  <p className="text-xs text-slate-400">{formatSize(resume.fileSize)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleDownload(resume.id, resume.filename)}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
            disabled={uploadResume.isPending || resumes.length >= 10}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500 dark:text-slate-300"
          />
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
