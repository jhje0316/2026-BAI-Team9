import { copyFileSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const presentation = import.meta.dirname;
const root = path.dirname(presentation);
const output = path.join(root, 'dist');

rmSync(output, { recursive: true, force: true });
mkdirSync(output);

for (const file of ['index.html', 'switcher.css', 'switcher.js', 'feedback-notes.js']) {
  copyFileSync(path.join(presentation, file), path.join(output, file));
}

for (const version of ['before', 'after']) {
  cpSync(path.join(root, 'versions', version, 'dist'), path.join(output, 'demo', version), { recursive: true });
}
