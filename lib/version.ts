// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
const fallbackAppVersion = "0.239"
const fallbackGitCommitCount = 49
const fallbackGitHash = "4bea13bb"
const fallbackBuildGeneratedAt = "2026-03-18T23:49:17.912Z"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? fallbackAppVersion
export const APP_GIT_COMMIT_COUNT = Number.parseInt(process.env.NEXT_PUBLIC_APP_GIT_COMMIT_COUNT ?? "49", 10)
export const APP_GIT_HASH = process.env.NEXT_PUBLIC_APP_GIT_HASH ?? fallbackGitHash
export const APP_BUILD_GENERATED_AT = process.env.NEXT_PUBLIC_APP_BUILD_GENERATED_AT ?? fallbackBuildGeneratedAt
