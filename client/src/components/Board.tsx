import { useState } from 'react';
import { STATUSES, STATUS_LABELS, type Application, type Status } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
  onStatusChange: (application: Application, status: Status) => void;
}

export function Board({ applications, onEdit, onDelete, onStatusChange }: Props) {
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);

  const byStatus = STATUSES.map((status) => ({
    status,
    items: applications.filter((app) => app.status === status),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {byStatus.map(({ status, items }) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStatus(status);
          }}
          onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const app = applications.find((a) => a.id === id);
            if (app && app.status !== status) onStatusChange(app, status);
            setDragOverStatus(null);
          }}
          className={`flex min-h-[120px] flex-col gap-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
            dragOverStatus === status
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{STATUS_LABELS[status]}</h3>
            <span className="text-xs text-slate-400">{items.length}</span>
          </div>

          {items.map((app) => (
            <div
              key={app.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', app.id)}
              className="cursor-grab active:cursor-grabbing"
            >
              <ApplicationCard application={app} onEdit={() => onEdit(app)} onDelete={() => onDelete(app)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
