import { loadRegistryGraph } from "./registry-graph"

const internalPrefixIndex = process.argv.indexOf("--internal-dependencies")
const internalPrefix =
  internalPrefixIndex >= 0 ? process.argv[internalPrefixIndex + 1] : undefined

if (internalPrefixIndex >= 0 && !internalPrefix) {
  throw new Error("--internal-dependencies requires a registry prefix")
}

const { items } = loadRegistryGraph()

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
