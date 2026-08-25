import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const workflowDirectory = fileURLToPath(
  new URL("../.github/workflows/", import.meta.url)
)
const workflowFiles = readdirSync(workflowDirectory)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort()
const usesLine = /^\s*(?:-\s*)?uses:\s*["']?([^"'#\s]+)["']?/
const immutableGitRef = /@[0-9a-f]{40}$/i
const violations = []

for (const file of workflowFiles) {
  const lines = readFileSync(join(workflowDirectory, file), "utf8").split("\n")

  for (const [index, line] of lines.entries()) {
    const match = line.match(usesLine)
    if (!match) continue

    const target = match[1]
    if (target.startsWith("./") || immutableGitRef.test(target)) continue

    violations.push(`${file}:${index + 1}: ${target}`)
  }
}

if (violations.length > 0) {
  console.error(
    "Every non-local workflow `uses:` target must end in a full 40-character commit SHA:"
  )
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log(
  `✓ ${workflowFiles.length} workflow files use immutable action refs`
)
