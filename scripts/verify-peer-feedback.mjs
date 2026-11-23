import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

// Run from the repository root. Requires Google Chrome for the browser suite.
for (const command of ['lint', 'test', 'build', 'test:e2e']) {
  const result = spawnSync('npm', ['run', command], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const required = [
  'docs/peer-feedback-before-after.md',
  'docs/peer-feedback-presentation.md',
  'docs/screenshots/before-en.png',
  'docs/screenshots/after-en.png',
  'docs/screenshots/after-ko.png',
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`Missing deliverable: ${file}`);
}

const script = readFileSync('docs/peer-feedback-presentation.md', 'utf8');
const pairs = script.trim().split(/\n\n+/).filter(block => !/^(#|\*\[|AI and Business)/.test(block));
for (const pair of pairs) {
  const [english, korean, ...extra] = pair.split('\n');
  if (!english || !korean || extra.length || /[가-힣]/.test(english) || !/[가-힣]/.test(korean)) {
    throw new Error(`Expected an English sentence followed by its Korean translation: ${english}`);
  }
}
console.info(`Verified all checks and deliverables. Bilingual script: ${pairs.length} sentence pairs.`);
