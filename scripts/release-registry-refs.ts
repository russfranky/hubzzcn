import { readFileSync, writeFileSync } from "node:fs"

const REPOSITORY_PREFIX = "russfranky/hubzzcn/"
const REGISTRY_FILES = [
  "src/components/ui/registry.json",
  "src/components/hubzz/registry.json",
]

function normalizeRef(address: string, ref: string) {
  const [item] = address.split("#", 1)
  return `${item}#${ref}`
}

function updateRegistryFile(path: string, ref: string) {
  const registry = JSON.parse(readFileSync(path, "utf8")) as {
    items: Array<{ registryDependencies?: string[] }>
  }

  for (const item of registry.items) {
    if (!item.registryDependencies) continue
    item.registryDependencies = item.registryDependencies.map((dependency) =>
      dependency.startsWith(REPOSITORY_PREFIX)
        ? normalizeRef(dependency, ref)
        : dependency
    )
  }

  writeFileSync(path, `${JSON.stringify(registry, null, 2)}\n`)
}

function verifyRegistryFile(path: string, ref: string) {
  const registry = JSON.parse(readFileSync(path, "utf8")) as {
    items: Array<{ name?: string; registryDependencies?: string[] }>
  }

  const failures: string[] = []
  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      if (
        dependency.startsWith(REPOSITORY_PREFIX) &&
        !dependency.endsWith(`#${ref}`)
      ) {
        failures.push(`${item.name ?? "unnamed"}: ${dependency}`)
      }
    }
  }

  return failures
}

const mode = process.argv[2]
const ref = process.argv[3]

if (!ref || !["pin", "verify"].includes(mode ?? "")) {
  console.error("Usage: tsx scripts/release-registry-refs.ts <pin|verify> <ref>")
  process.exit(1)
}

if (mode === "pin") {
  for (const path of REGISTRY_FILES) updateRegistryFile(path, ref)
  console.log(`✓ pinned Hubzz registry dependencies to ${ref}`)
} else {
  const failures = REGISTRY_FILES.flatMap((path) => verifyRegistryFile(path, ref))
  if (failures.length) {
    console.error(`Registry dependencies are not pinned to ${ref}:`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log(`✓ Hubzz registry dependencies are pinned to ${ref}`)
}
