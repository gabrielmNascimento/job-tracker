import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

const statusValues = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;

const httpUrl = z.preprocess(
  (val) => (typeof val === 'string' && val !== '' && !/^https?:\/\//i.test(val) ? `https://${val}` : val),
  z.string().max(500).url('Enter a valid URL'),
);

const applicationSchema = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  status: z.enum(statusValues).default('APPLIED'),
  url: httpUrl.optional().or(z.literal('')),
  location: z.string().max(120).optional(),
  salary: z
    .string()
    .regex(/^\d{1,6}$/, 'Numbers only, up to 6 digits')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000).optional(),
  appliedAt: z.string().datetime().optional(),
  resumeId: z.string().cuid().optional().or(z.literal('')),
});

async function resolveResumeId(userId: string, resumeId: string | undefined) {
  if (resumeId === undefined) return undefined;
  if (resumeId === '') return null;
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId }, select: { id: true } });
  return resume ? resume.id : 'invalid';
}

const resumeInclude = { resume: { select: { id: true, filename: true } } } as const;

applicationsRouter.get('/', async (req: AuthedRequest, res) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
    include: resumeInclude,
  });
  res.json(applications);
});

applicationsRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { url, appliedAt, resumeId, ...rest } = parsed.data;
  const resolvedResumeId = await resolveResumeId(req.userId!, resumeId);
  if (resolvedResumeId === 'invalid') {
    res.status(400).json({ error: 'Resume not found' });
    return;
  }

  const application = await prisma.application.create({
    data: {
      ...rest,
      url: url || undefined,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      resumeId: resolvedResumeId,
      userId: req.userId!,
    },
    include: resumeInclude,
  });
  res.status(201).json(application);
});

applicationsRouter.patch('/:id', async (req: AuthedRequest, res) => {
  const parsed = applicationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const { url, appliedAt, resumeId, ...rest } = parsed.data;
  const resolvedResumeId = await resolveResumeId(req.userId!, resumeId);
  if (resolvedResumeId === 'invalid') {
    res.status(400).json({ error: 'Resume not found' });
    return;
  }

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: {
      ...rest,
      url: url || undefined,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      resumeId: resolvedResumeId,
    },
    include: resumeInclude,
  });
  res.json(application);
});

applicationsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  await prisma.application.delete({ where: { id: existing.id } });
  res.status(204).send();
});
