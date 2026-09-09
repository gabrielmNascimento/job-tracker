import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

const statusValues = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;

const httpUrl = z
  .string()
  .url()
  .refine((val) => /^https?:\/\//i.test(val), 'URL must start with http:// or https://');

const applicationSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(statusValues).default('APPLIED'),
  url: httpUrl.optional().or(z.literal('')),
  location: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
  appliedAt: z.string().datetime().optional(),
});

applicationsRouter.get('/', async (req: AuthedRequest, res) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(applications);
});

applicationsRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { url, appliedAt, ...rest } = parsed.data;
  const application = await prisma.application.create({
    data: {
      ...rest,
      url: url || undefined,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      userId: req.userId!,
    },
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

  const { url, appliedAt, ...rest } = parsed.data;
  const application = await prisma.application.update({
    where: { id: existing.id },
    data: {
      ...rest,
      url: url || undefined,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
    },
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
