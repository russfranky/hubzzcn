import { writeFileSync } from "node:fs"
import { format } from "prettier"

import {
  loadRegistryGraph,
  repoRelative,
  type RegistryFile,
} from "./registry-graph"

const REPOSITORY_PREFIX = "russfranky/hubzzcn/"

function normalizeRef(address: string, ref: string): string {
  const [item] = address.split("#", 1)
  return `${item}#${ref}`
}

async function updateRegistryFile(file: RegistryFile, ref: string) {
  let changed = false

  for (const item of file.document.items ?? []) {
    if (!item.registryDependencies) continue
    item.registryDependencies = item.registryDependencies.map((dependency) => {
      if (!dependency.startsWith(REPOSITORY_PREFIX)) return dependency
      const pinned = normalizeRef(dependency, ref)
      if (pinned !== dependency) changed = true
      return pinned
    })
  }

  if (!changed) return false

  const output = await format(JSON.stringify(file.document), { parser: "json" })
  writeFileSync(file.path, output)
  return true
}

function verifyRegistryFile(file: RegistryFile, ref: string): string[] {
  const failures: string[] = []

  for (const item of file.document.items ?? []) {
    for (const dependency of item.registryDependencies ?? []) {
      if (
        dependency.startsWith(REPOSITORY_PREFIX) &&
        !dependency.endsWith(`#${ref}`)
      ) {
        failures.push(`${repoRelative(file.path)}:${item.name}: ${dependency}`)
      }
    }
  }

  return failures
}

const mode = process.argv[2]
const ref = process.argv[3]

if (!ref || !["pin", "verify"].includes(mode ?? "")) {
  console.error(
    "Usage: tsx scripts/release-registry-refs.ts <pin|verify> <ref>"
  )
  process.exit(1)
}

const { files } = loadRegistryGraph()

if (mode === "pin") {
  let changedFiles = 0
  for (const file of files) {
    if (await updateRegistryFile(file, ref)) changedFiles += 1
  }
  console.log(
    `✓ pinned Hubzz registry dependencies to ${ref} in ${changedFiles} registry file(s)`
  )
} else {
  const failures = files.flatMap((file) => verifyRegistryFile(file, ref))
  if (failures.length) {
    console.error(`Registry dependencies are not pinned to ${ref}:`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log(`✓ Hubzz registry dependencies are pinned to ${ref}`)
}
