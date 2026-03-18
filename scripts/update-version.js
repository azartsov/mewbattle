#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionPath = path.join(__dirname, '../lib/version.ts');
const serviceWorkerPath = path.join(__dirname, '../public/sw.js');
const versionManifestPath = path.join(__dirname, '../public/version.json');
const repoRoot = path.join(__dirname, '..');
const VERSION_OFFSET = 190;
const generatedAt = new Date().toISOString();

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
const fallbackAppVersion = "0.${minorVersion}"
const fallbackGitCommitCount = ${gitCommitCount}
const fallbackGitHash = "${gitShortHash}"
const fallbackBuildGeneratedAt = "${generatedAt}"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? fallbackAppVersion
export const APP_GIT_COMMIT_COUNT = Number.parseInt(process.env.NEXT_PUBLIC_APP_GIT_COMMIT_COUNT ?? "${gitCommitCount}", 10)
export const APP_GIT_HASH = process.env.NEXT_PUBLIC_APP_GIT_HASH ?? fallbackGitHash
export const APP_BUILD_GENERATED_AT = process.env.NEXT_PUBLIC_APP_BUILD_GENERATED_AT ?? fallbackBuildGeneratedAt
`;

fs.writeFileSync(versionPath, newVersionContent, 'utf-8');

const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf-8');
if (!/const APP_VERSION = "0\.\d+";/.test(serviceWorkerContent)) {
  throw new Error('Could not locate service worker version marker');
}

const newServiceWorkerContent = serviceWorkerContent.replace(
  /const APP_VERSION = "0\.\d+";/,
  `const APP_VERSION = "0.${minorVersion}";`
);

if (newServiceWorkerContent !== serviceWorkerContent) {
  fs.writeFileSync(serviceWorkerPath, newServiceWorkerContent, 'utf-8');
}
fs.writeFileSync(
  versionManifestPath,
  `${JSON.stringify({ version: `0.${minorVersion}`, gitCommitCount, gitHash: gitShortHash, generatedAt }, null, 2)}\n`,
  'utf-8'
);

console.log(`✓ Version updated to 0.${minorVersion} (git ${gitCommitCount}, ${gitShortHash})`);
