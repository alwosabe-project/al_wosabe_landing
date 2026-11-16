import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const repoRoot = resolve(import.meta.dirname, '../..');
export const reportDirectory = resolve(process.env.PERF_REPORT_DIR || resolve(repoRoot, 'artifacts/performance'));
export const chromeExecutable = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
const require = createRequire(resolve(process.env.PERF_TOOLS_DIR || repoRoot, 'package.json'));
export const requireTool = name => require(name);
export const importTool = name => import(pathToFileURL(require.resolve(name)).href);
