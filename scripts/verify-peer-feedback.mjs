import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

// Run from the repository root. Requires Google Chrome for the browser suite.
for (const command of ['lint', 'test', 'build', 'test:e2e']) {
  const result = spawnSync('npm', ['run', command], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const required = ['docs/peer-feedback-before-after.md', 'docs/peer-feedback-presentation-en.md', 'docs/peer-feedback-presentation-ko.md', 'docs/screenshots/before-en.png', 'docs/screenshots/after-en.png', 'docs/screenshots/after-ko.png'];
for (const file of required) if (!existsSync(file)) throw new Error(`Missing deliverable: ${file}`);
const script = readFileSync('docs/peer-feedback-presentation-en.md', 'utf8');
const spoken = script.split('<!-- script:start -->')[1]?.split('<!-- script:end -->')[0];
if (!spoken) throw new Error('English script markers are missing');
const words = spoken.replace(/^##.*$/gm, '').replace(/\[[^\]]*\]/g, '').trim().split(/\s+/).length;
if (words < 600 || words > 700) throw new Error(`English spoken script has ${words} words; expected 600–700`);
console.info(`Verified all checks and deliverables. English spoken script: ${words} words.`);
