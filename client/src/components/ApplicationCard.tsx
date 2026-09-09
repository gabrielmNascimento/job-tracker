import type { Application } from '../types';

interface Props {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApplicationCard({ application, onEdit, onDelete }: Props) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{application.company}</p>
          <p className="truncate text-sm text-slate-600 dark:text-slate-400">{application.role}</p>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Edit"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/40"
            aria-label="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {(application.location || application.salary) && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {[application.location, application.salary].filter(Boolean).join(' · ')}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        Applied {new Date(application.appliedAt).toLocaleDateString()}
      </p>

      {application.url && (
        <a
          href={application.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View posting ↗
        </a>
      )}
    </div>
  );
}
