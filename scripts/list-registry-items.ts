import {
  internalRegistryDependencyNames,
  loadRegistryGraph,
} from "./registry-graph"

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

for (const name of internalRegistryDependencyNames(items, internalPrefix)) {
  console.log(name)
}
