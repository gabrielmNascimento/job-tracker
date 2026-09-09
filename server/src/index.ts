import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { env } from './lib/env.js';
import { applicationsRouter } from './routes/applications.js';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ name: 'job-tracker-api', health: '/health', api: '/api' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
