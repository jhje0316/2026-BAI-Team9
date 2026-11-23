import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createApiApp as createBeforeApi } from '../versions/before/server.ts';

const app = express();
const presentationDir = import.meta.dirname;
app.use('/demo/before', createBeforeApi());

for (const name of ['before', 'after']) {
  const dist = path.resolve(presentationDir, '../versions', name, 'dist');
  if (!existsSync(path.join(dist, 'index.html'))) {
    throw new Error(`Missing ${name} build. Run npm run build first.`);
  }
  app.use(`/demo/${name}`, express.static(dist));
}

app.get('/', (_req, res) => res.redirect('/after'));
app.get(['/before', '/after'], (_req, res) => res.sendFile(path.join(presentationDir, 'index.html')));
app.get('/switcher.css', (_req, res) => res.sendFile(path.join(presentationDir, 'switcher.css')));
app.get('/switcher.js', (_req, res) => res.sendFile(path.join(presentationDir, 'switcher.js')));
app.get('/feedback-notes.js', (_req, res) => res.sendFile(path.join(presentationDir, 'feedback-notes.js')));

const port = Number(process.env.PORT || 4173);
app.listen(port, '127.0.0.1', () => {
  console.info(`AI Anti-Counterfeit Solution · http://127.0.0.1:${port}`);
});
