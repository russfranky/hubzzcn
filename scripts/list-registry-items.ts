import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

interface RegistryItem {
  name: string
  registryDependencies?: string[]
}

interface RegistryFile {
  include?: string[]
  items?: RegistryItem[]
}

const ROOT_REGISTRY = resolve("registry.json")
const internalPrefixIndex = process.argv.indexOf("--internal-dependencies")
const internalPrefix =
  internalPrefixIndex >= 0 ? process.argv[internalPrefixIndex + 1] : undefined

if (internalPrefixIndex >= 0 && !internalPrefix) {
  throw new Error("--internal-dependencies requires a registry prefix")
}

const seenFiles = new Set<string>()
const seenItems = new Set<string>()
const items: RegistryItem[] = []

function readRegistry(path: string): RegistryFile {
  if (seenFiles.has(path)) return {}
  seenFiles.add(path)

  const registry = JSON.parse(readFileSync(path, "utf8")) as RegistryFile

  for (const item of registry.items ?? []) {
    if (!item.name || typeof item.name !== "string") {
      throw new Error(`Registry item in ${path} is missing a valid name`)
    }
    if (seenItems.has(item.name)) {
      throw new Error(`Duplicate registry item: ${item.name}`)
    }
    seenItems.add(item.name)
    items.push(item)
  }

  for (const include of registry.include ?? []) {
    readRegistry(resolve(dirname(path), include))
  }

  return registry
}

readRegistry(ROOT_REGISTRY)

if (!internalPrefix) {
  for (const item of items) console.log(item.name)
  process.exit(0)
}

const prefix = `${internalPrefix.replace(/\/$/, "")}/`
const dependencies = new Set<string>()

for (const item of items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (!dependency.startsWith(prefix)) continue
    const name = dependency.slice(prefix.length).split("#", 1)[0]
    if (name) dependencies.add(name)
  }
}

for (const item of items) {
  if (dependencies.has(item.name)) console.log(item.name)
}
