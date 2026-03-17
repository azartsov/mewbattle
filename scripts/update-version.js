#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read current version from version.ts
const versionPath = path.join(__dirname, '../lib/version.ts');
const serviceWorkerPath = path.join(__dirname, '../public/sw.js');
const versionManifestPath = path.join(__dirname, '../public/version.json');
const versionContent = fs.readFileSync(versionPath, 'utf-8');

// Extract current minor version
const versionMatch = versionContent.match(/export const APP_VERSION = "0\.(\d+)"/);
let minorVersion = 0;

if (versionMatch) {
  minorVersion = parseInt(versionMatch[1], 10);
}

// Increment minor version
minorVersion++;

// Write updated version
const newVersionContent = `// Application version
// Format: 0.MINOR where MINOR increments with each build
export const APP_VERSION = "0.${minorVersion}"
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
  `${JSON.stringify({ version: `0.${minorVersion}`, generatedAt: new Date().toISOString() }, null, 2)}\n`,
  'utf-8'
);

console.log(`✓ Version updated to 0.${minorVersion}`);
