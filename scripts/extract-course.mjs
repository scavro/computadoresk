import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
execFileSync('python3', [path.join(scriptDir, 'extract-course.py')], {
  stdio: 'inherit',
});
