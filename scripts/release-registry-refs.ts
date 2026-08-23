import { writeFileSync } from "node:fs"
import { format } from "prettier"

import {
  internalRegistryDependencyNames,
  loadRegistryGraph,
  parseInternalRegistryDependency,
  repoRelative,
  type RegistryFile,
} from "./registry-graph"

const REPOSITORY_ADDRESS = "russfranky/hubzzcn"
const REPOSITORY_PREFIX = `${REPOSITORY_ADDRESS}/`

function pinDependency(dependency: string, ref: string): string {
  const parsed = parseInternalRegistryDependency(
    dependency,
    REPOSITORY_ADDRESS
  )
  if (!parsed) return dependency
  return `${REPOSITORY_PREFIX}${parsed.name}#${ref}`
}

async function updateRegistryFile(file: RegistryFile, ref: string) {
  let changed = false

  for (const item of file.document.items ?? []) {
    if (!item.registryDependencies) continue
    item.registryDependencies = item.registryDependencies.map((dependency) => {
      const pinned = pinDependency(dependency, ref)
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
      const parsed = parseInternalRegistryDependency(
        dependency,
        REPOSITORY_ADDRESS
      )
      if (parsed && parsed.ref !== ref) {
        failures.push(`${repoRelative(file.path)}:${item.name}: ${dependency}`)
      }
    }
  }

  return failures
}

const mode = process.argv[2]
const ref = process.argv[3]

if (
  !ref ||
  ref.trim() !== ref ||
  ref.includes("#") ||
  !["pin", "verify"].includes(mode ?? "")
) {
  console.error(
    "Usage: tsx scripts/release-registry-refs.ts <pin|verify> <ref>"
  )
  process.exit(1)
}

const { files, items } = loadRegistryGraph()
internalRegistryDependencyNames(items, REPOSITORY_ADDRESS)

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
