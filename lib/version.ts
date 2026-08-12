// Application version
// Format: 0.(VERSION_OFFSET + git commit count)
const fallbackAppVersion = "0.246"
const fallbackGitCommitCount = 56
const fallbackGitHash = "94623345"
const fallbackBuildGeneratedAt = "2026-03-29T20:36:24.525Z"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? fallbackAppVersion
export const APP_GIT_COMMIT_COUNT = Number.parseInt(process.env.NEXT_PUBLIC_APP_GIT_COMMIT_COUNT ?? "56", 10)
export const APP_GIT_HASH = process.env.NEXT_PUBLIC_APP_GIT_HASH ?? fallbackGitHash
export const APP_BUILD_GENERATED_AT = process.env.NEXT_PUBLIC_APP_BUILD_GENERATED_AT ?? fallbackBuildGeneratedAt
