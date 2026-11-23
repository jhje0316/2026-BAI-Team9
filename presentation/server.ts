import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createApiApp as createBeforeApi } from '../versions/before/server.ts';

const dist = path.resolve(import.meta.dirname, '../dist');
for (const indexFile of ['index.html', 'demo/before/index.html', 'demo/after/index.html']) {
  if (!existsSync(path.join(dist, indexFile))) {
    throw new Error('Missing presentation build. Run npm run build first.');
  }
}

const app = express();
app.use('/demo/before', createBeforeApi());
app.get('/', (_req, res) => res.redirect('/after'));
app.get(['/before', '/after'], (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.use(express.static(dist));

const port = Number(process.env.PORT || 4173);
app.listen(port, '127.0.0.1', () => {
  console.info(`AI Anti-Counterfeit Solution · http://127.0.0.1:${port}`);
});
