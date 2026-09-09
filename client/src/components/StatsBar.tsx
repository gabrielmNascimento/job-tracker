import type { Application } from '../types';

export function StatsBar({ applications }: { applications: Application[] }) {
  const total = applications.length;
  const active = applications.filter((a) => !['REJECTED', 'WISHLIST'].includes(a.status)).length;
  const offers = applications.filter((a) => a.status === 'OFFER').length;
  const responseRate = total
    ? Math.round(
        (applications.filter((a) => a.status !== 'APPLIED' && a.status !== 'WISHLIST').length / total) * 100,
      )
    : 0;

  const stats = [
    { label: 'Total applications', value: total },
    { label: 'In progress', value: active },
    { label: 'Offers', value: offers },
    { label: 'Response rate', value: `${responseRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
