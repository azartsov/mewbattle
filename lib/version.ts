// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
const fallbackAppVersion = "0.233"
const fallbackGitCommitCount = 43
const fallbackGitHash = "5b6843c9"
const fallbackBuildGeneratedAt = "2026-03-18T23:21:39.451Z"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? fallbackAppVersion
export const APP_GIT_COMMIT_COUNT = Number.parseInt(process.env.NEXT_PUBLIC_APP_GIT_COMMIT_COUNT ?? "43", 10)
export const APP_GIT_HASH = process.env.NEXT_PUBLIC_APP_GIT_HASH ?? fallbackGitHash
export const APP_BUILD_GENERATED_AT = process.env.NEXT_PUBLIC_APP_BUILD_GENERATED_AT ?? fallbackBuildGeneratedAt
