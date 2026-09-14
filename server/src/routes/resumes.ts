import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const resumesRouter = Router();
resumesRouter.use(requireAuth);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_RESUMES_PER_USER = 10;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Only PDF and Word documents are allowed'));
      return;
    }
    cb(null, true);
  },
});

function sanitizeFilename(name: string): string {
  // multer/busboy decodes multipart filenames as latin1; browsers send UTF-8, so reverse that first
  const utf8Name = Buffer.from(name, 'latin1').toString('utf8');
  // oxlint-disable-next-line no-control-regex -- intentionally stripping control chars
  const cleaned = utf8Name.replace(/[\x00-\x1f\x7f/\\]/g, '_').trim();
  return cleaned.slice(0, 200) || 'resume';
}

resumesRouter.get('/', async (req: AuthedRequest, res) => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.userId },
    select: { id: true, filename: true, mimeType: true, fileSize: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(resumes);
});

resumesRouter.post('/', async (req: AuthedRequest, res) => {
  const count = await prisma.resume.count({ where: { userId: req.userId } });
  if (count >= MAX_RESUMES_PER_USER) {
    res.status(400).json({ error: `You can only keep up to ${MAX_RESUMES_PER_USER} resumes` });
    return;
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const resume = await prisma.resume.create({
      data: {
        filename: sanitizeFilename(req.file.originalname),
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        data: new Uint8Array(req.file.buffer),
        userId: req.userId!,
      },
      select: { id: true, filename: true, mimeType: true, fileSize: true, createdAt: true },
    });
    res.status(201).json(resume);
  });
});

resumesRouter.get('/:id/download', async (req: AuthedRequest, res) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }

  res.setHeader('Content-Type', resume.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(resume.filename)}`);
  res.send(Buffer.from(resume.data));
});

resumesRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }

  await prisma.resume.delete({ where: { id: existing.id } });
  res.status(204).send();
});
