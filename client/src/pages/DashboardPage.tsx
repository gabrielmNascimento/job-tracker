import { useMemo, useState } from 'react';
import { ApplicationForm, type ApplicationFormValues } from '../components/ApplicationForm';
import { Board } from '../components/Board';
import { Modal } from '../components/Modal';
import { ResumesModal } from '../components/ResumesModal';
import { StatsBar } from '../components/StatsBar';
import { useAuth } from '../context/AuthContext';
import { useApplications, useCreateApplication, useDeleteApplication, useUpdateApplication } from '../lib/useApplications';
import type { Application, Status } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: applications = [], isLoading } = useApplications();
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [resumesOpen, setResumesOpen] = useState(false);
  const [editing, setEditing] = useState<Application | undefined>(undefined);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter(
      (app) => app.company.toLowerCase().includes(query) || app.role.toLowerCase().includes(query),
    );
  }, [applications, search]);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(application: Application) {
    setEditing(application);
    setFormOpen(true);
  }

  async function handleSubmit(values: ApplicationFormValues) {
    if (editing) {
      await updateApplication.mutateAsync({ id: editing.id, data: values });
    } else {
      await createApplication.mutateAsync(values);
    }
    setFormOpen(false);
  }

  async function handleDelete(application: Application) {
    if (!confirm(`Delete the application for ${application.role} at ${application.company}?`)) return;
    await deleteApplication.mutateAsync(application.id);
  }

  async function handleStatusChange(application: Application, status: Status) {
    await updateApplication.mutateAsync({ id: application.id, data: { status } });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Job Tracker</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setResumesOpen(true)}
              className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
            >
              Resumes
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <StatsBar applications={applications} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or role..."
            className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            onClick={openCreate}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            + Add application
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading applications…</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {applications.length === 0
                ? 'No applications yet. Add your first one to get started.'
                : 'No applications match your search.'}
            </p>
          ) : (
            <Board
              applications={filtered}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </main>

      {formOpen && (
        <Modal title={editing ? 'Edit application' : 'Add application'} onClose={() => setFormOpen(false)}>
          <ApplicationForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
        </Modal>
      )}

      {resumesOpen && <ResumesModal onClose={() => setResumesOpen(false)} />}
    </div>
  );
}
