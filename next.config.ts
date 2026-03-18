import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const VERSION_OFFSET = 190;
const repoRoot = process.cwd();
const versionPath = path.join(repoRoot, "lib/version.ts");
const serviceWorkerPath = path.join(repoRoot, "public/sw.js");
const versionManifestPath = path.join(repoRoot, "public/version.json");

function createVersionModuleContent(appVersion: string, gitCommitCount: number, gitShortHash: string, generatedAt: string) {
  return `// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
const fallbackAppVersion = "${appVersion}"
const fallbackGitCommitCount = ${gitCommitCount}
const fallbackGitHash = "${gitShortHash}"
const fallbackBuildGeneratedAt = "${generatedAt}"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? fallbackAppVersion
export const APP_GIT_COMMIT_COUNT = Number.parseInt(process.env.NEXT_PUBLIC_APP_GIT_COMMIT_COUNT ?? "${gitCommitCount}", 10)
export const APP_GIT_HASH = process.env.NEXT_PUBLIC_APP_GIT_HASH ?? fallbackGitHash
export const APP_BUILD_GENERATED_AT = process.env.NEXT_PUBLIC_APP_BUILD_GENERATED_AT ?? fallbackBuildGeneratedAt
`;
}

function resolveVersionMetadata() {
  const gitCommitCount = Number.parseInt(
    execSync("git rev-list --count HEAD", { cwd: repoRoot, encoding: "utf-8" }).trim(),
    10,
  );
  const gitShortHash = execSync("git rev-parse --short=8 HEAD", { cwd: repoRoot, encoding: "utf-8" }).trim();

  if (!Number.isFinite(gitCommitCount) || gitCommitCount <= 0) {
    throw new Error("Could not derive git commit count for version generation");
  }

  const appVersion = `0.${VERSION_OFFSET + gitCommitCount}`;
  const existingVersionContent = existsSync(versionPath) ? readFileSync(versionPath, "utf-8") : "";
  const generatedAtMatch = existingVersionContent.match(/fallbackBuildGeneratedAt = "([^"]+)"/);
  const versionAlreadySynced = existingVersionContent.includes(`const fallbackAppVersion = "${appVersion}"`)
    && existingVersionContent.includes(`const fallbackGitCommitCount = ${gitCommitCount}`)
    && existingVersionContent.includes(`const fallbackGitHash = "${gitShortHash}"`);

  return {
    appVersion,
    gitCommitCount,
    gitShortHash,
    generatedAt: versionAlreadySynced && generatedAtMatch ? generatedAtMatch[1] : new Date().toISOString(),
    versionAlreadySynced,
  };
}

function syncVersionMetadata() {
  try {
    const metadata = resolveVersionMetadata();
    const nextVersionContent = createVersionModuleContent(
      metadata.appVersion,
      metadata.gitCommitCount,
      metadata.gitShortHash,
      metadata.generatedAt,
    );

    if (!metadata.versionAlreadySynced) {
      writeFileSync(versionPath, nextVersionContent, "utf-8");
    }

    const serviceWorkerContent = readFileSync(serviceWorkerPath, "utf-8");
    const nextServiceWorkerContent = serviceWorkerContent.replace(
      /const APP_VERSION = "0\.\d+";/,
      `const APP_VERSION = "${metadata.appVersion}";`,
    );
    if (nextServiceWorkerContent !== serviceWorkerContent) {
      writeFileSync(serviceWorkerPath, nextServiceWorkerContent, "utf-8");
    }

    const nextManifestContent = `${JSON.stringify({ version: metadata.appVersion, gitCommitCount: metadata.gitCommitCount, gitHash: metadata.gitShortHash, generatedAt: metadata.generatedAt }, null, 2)}\n`;
    const existingManifestContent = existsSync(versionManifestPath) ? readFileSync(versionManifestPath, "utf-8") : "";
    if (nextManifestContent !== existingManifestContent) {
      writeFileSync(versionManifestPath, nextManifestContent, "utf-8");
    }

    return metadata;
  } catch (error) {
    console.warn("Could not sync version metadata during Next config load:", error);
    return null;
  }
}

const versionMetadata = syncVersionMetadata();

const nextConfig: NextConfig = {
  env: versionMetadata ? {
    NEXT_PUBLIC_APP_VERSION: versionMetadata.appVersion,
    NEXT_PUBLIC_APP_GIT_COMMIT_COUNT: String(versionMetadata.gitCommitCount),
    NEXT_PUBLIC_APP_GIT_HASH: versionMetadata.gitShortHash,
    NEXT_PUBLIC_APP_BUILD_GENERATED_AT: versionMetadata.generatedAt,
  } : undefined,
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
