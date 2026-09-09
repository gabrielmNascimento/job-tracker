import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './lib/env.js';
import { applicationsRouter } from './routes/applications.js';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (_req, res) => res.json({ name: 'job-tracker-api', health: '/health', api: '/api' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/applications', applicationsRouter);

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
