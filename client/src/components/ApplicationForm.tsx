import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { STATUSES, STATUS_LABELS, type Application } from '../types';

function normalizeUrl(val: string): string {
  const trimmed = val.trim();
  return trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
}

const schema = z.object({
  company: z.string().min(1, 'Required').max(120, 'Too long'),
  role: z.string().min(1, 'Required').max(120, 'Too long'),
  status: z.enum(STATUSES),
  url: z.string().max(500).url('Enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(120, 'Too long').optional(),
  salary: z
    .string()
    .regex(/^\d{1,6}$/, 'Numbers only, up to 6 digits')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000, 'Too long').optional(),
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
    setValue,
    getValues,
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

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    const url = getValues('url');
    if (url) setValue('url', normalizeUrl(url));
    return handleSubmit(onSubmit)(e);
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input {...register('company')} className={inputClass} maxLength={120} autoFocus />
          {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input {...register('role')} className={inputClass} maxLength={120} />
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
          <input {...register('location')} className={inputClass} maxLength={120} />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Job URL</label>
          <input
            {...register('url')}
            onBlur={(e) => setValue('url', normalizeUrl(e.target.value))}
            className={inputClass}
            placeholder="example.com"
          />
          {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Salary</label>
          <input
            {...register('salary')}
            onChange={(e) => setValue('salary', e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            className={inputClass}
            placeholder="e.g. 120000"
            maxLength={6}
          />
          {errors.salary && <p className="mt-1 text-xs text-red-600">{errors.salary.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea {...register('notes')} rows={3} className={inputClass} maxLength={1000} />
        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>}
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
