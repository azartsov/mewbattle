import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const VERSION_OFFSET = 190;
const repoRoot = process.cwd();
const versionPath = path.join(repoRoot, "lib/version.ts");
const serviceWorkerPath = path.join(repoRoot, "public/sw.js");
const versionManifestPath = path.join(repoRoot, "public/version.json");

function syncVersionMetadata() {
  try {
    const gitCommitCount = Number.parseInt(
      execSync("git rev-list --count HEAD", { cwd: repoRoot, encoding: "utf-8" }).trim(),
      10,
    );
    const gitShortHash = execSync("git rev-parse --short=8 HEAD", { cwd: repoRoot, encoding: "utf-8" }).trim();

    if (!Number.isFinite(gitCommitCount) || gitCommitCount <= 0) {
      return;
    }

    const appVersion = `0.${VERSION_OFFSET + gitCommitCount}`;
    const existingVersionContent = existsSync(versionPath) ? readFileSync(versionPath, "utf-8") : "";
    const versionAlreadySynced = existingVersionContent.includes(`export const APP_VERSION = "${appVersion}"`)
      && existingVersionContent.includes(`export const APP_GIT_COMMIT_COUNT = ${gitCommitCount}`)
      && existingVersionContent.includes(`export const APP_GIT_HASH = "${gitShortHash}"`);

    if (versionAlreadySynced) {
      return;
    }

    const generatedAt = new Date().toISOString();
    const nextVersionContent = `// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
export const APP_VERSION = "${appVersion}"
export const APP_GIT_COMMIT_COUNT = ${gitCommitCount}
export const APP_GIT_HASH = "${gitShortHash}"
export const APP_BUILD_GENERATED_AT = "${generatedAt}"
`;

    writeFileSync(versionPath, nextVersionContent, "utf-8");

    const serviceWorkerContent = readFileSync(serviceWorkerPath, "utf-8");
    const nextServiceWorkerContent = serviceWorkerContent.replace(
      /const APP_VERSION = "0\.\d+";/,
      `const APP_VERSION = "${appVersion}";`,
    );
    if (nextServiceWorkerContent !== serviceWorkerContent) {
      writeFileSync(serviceWorkerPath, nextServiceWorkerContent, "utf-8");
    }

    const nextManifestContent = `${JSON.stringify({ version: appVersion, gitCommitCount, gitHash: gitShortHash, generatedAt }, null, 2)}\n`;
    const existingManifestContent = existsSync(versionManifestPath) ? readFileSync(versionManifestPath, "utf-8") : "";
    if (nextManifestContent !== existingManifestContent) {
      writeFileSync(versionManifestPath, nextManifestContent, "utf-8");
    }
  } catch (error) {
    console.warn("Could not sync version metadata during Next config load:", error);
  }
}

syncVersionMetadata();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
