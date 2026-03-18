#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionPath = path.join(__dirname, '../lib/version.ts');
const serviceWorkerPath = path.join(__dirname, '../public/sw.js');
const versionManifestPath = path.join(__dirname, '../public/version.json');
const repoRoot = path.join(__dirname, '..');
const VERSION_OFFSET = 190;

const gitCommitCount = Number.parseInt(
  execSync('git rev-list --count HEAD', { cwd: repoRoot, encoding: 'utf-8' }).trim(),
  10,
);
const gitShortHash = execSync('git rev-parse --short=8 HEAD', { cwd: repoRoot, encoding: 'utf-8' }).trim();

if (!Number.isFinite(gitCommitCount) || gitCommitCount <= 0) {
  throw new Error('Could not derive git commit count for version generation');
}

const minorVersion = VERSION_OFFSET + gitCommitCount;

const newVersionContent = `// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
export const APP_VERSION = "0.${minorVersion}"
export const APP_GIT_COMMIT_COUNT = ${gitCommitCount}
export const APP_GIT_HASH = "${gitShortHash}"
`;

fs.writeFileSync(versionPath, newVersionContent, 'utf-8');

const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf-8');
const newServiceWorkerContent = serviceWorkerContent.replace(
  /const APP_VERSION = "0\.\d+";/,
  `const APP_VERSION = "0.${minorVersion}";`
);

if (newServiceWorkerContent === serviceWorkerContent) {
  throw new Error('Could not update service worker version');
}

fs.writeFileSync(serviceWorkerPath, newServiceWorkerContent, 'utf-8');
fs.writeFileSync(
  versionManifestPath,
  `${JSON.stringify({ version: `0.${minorVersion}`, gitCommitCount, gitHash: gitShortHash, generatedAt: new Date().toISOString() }, null, 2)}\n`,
  'utf-8'
);

console.log(`✓ Version updated to 0.${minorVersion} (git ${gitCommitCount}, ${gitShortHash})`);
