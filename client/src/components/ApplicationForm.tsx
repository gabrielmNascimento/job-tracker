import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { STATUSES, STATUS_LABELS, type Application } from '../types';

const httpUrl = z
  .string()
  .url('Enter a valid URL')
  .refine((val) => /^https?:\/\//i.test(val), 'URL must start with http:// or https://');

const schema = z.object({
  company: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  status: z.enum(STATUSES),
  url: httpUrl.optional().or(z.literal('')),
  location: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

export type ApplicationFormValues = z.infer<typeof schema>;

interface Props {
  initial?: Application;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ApplicationForm({ initial, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          company: initial.company,
          role: initial.role,
          status: initial.status,
          url: initial.url ?? '',
          location: initial.location ?? '',
          salary: initial.salary ?? '',
          notes: initial.notes ?? '',
        }
      : { status: 'APPLIED' },
  });

  const inputClass =
    'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input {...register('company')} className={inputClass} autoFocus />
          {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input {...register('role')} className={inputClass} />
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select {...register('status')} className={inputClass}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input {...register('location')} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Job URL</label>
          <input {...register('url')} className={inputClass} placeholder="https://..." />
          {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Salary</label>
          <input {...register('salary')} className={inputClass} placeholder="e.g. $120k" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea {...register('notes')} rows={3} className={inputClass} />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {initial ? 'Save changes' : 'Add application'}
        </button>
      </div>
    </form>
  );
}
