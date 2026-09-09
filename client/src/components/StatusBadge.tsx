import { STATUS_LABELS, type Status } from '../types';

const COLORS: Record<Status, string> = {
  WISHLIST: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  SCREENING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  OFFER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
