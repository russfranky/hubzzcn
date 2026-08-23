import { readFileSync } from "node:fs"
import { dirname, isAbsolute, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

export interface RegistryItem {
  name: string
  registryDependencies?: string[]
  [key: string]: unknown
}

export interface RegistryDocument {
  include?: string[]
  items?: RegistryItem[]
  [key: string]: unknown
}

export interface RegistryFile {
  path: string
  document: RegistryDocument
}

export interface InternalRegistryDependency {
  name: string
  ref?: string
}

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
export const ROOT_REGISTRY = resolve(REPO_ROOT, "registry.json")

const ITEM_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

export function repoRelative(path: string): string {
  return relative(REPO_ROOT, path)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function graphRelative(rootDirectory: string, path: string): string {
  return relative(rootDirectory, path) || "."
}

function validateItemName(name: unknown, context: string): string {
  if (
    typeof name !== "string" ||
    name.length === 0 ||
    name.trim() !== name ||
    !ITEM_NAME_PATTERN.test(name)
  ) {
    throw new Error(`${context} has an invalid registry item name`)
  }
  return name
}

function validateRegistryDocument(
  value: unknown,
  path: string,
  rootDirectory: string
): RegistryDocument {
  const label = graphRelative(rootDirectory, path)
  if (!isRecord(value)) {
    throw new Error(`Registry file ${label} must contain a JSON object`)
  }

  if (value.include !== undefined) {
    if (!Array.isArray(value.include)) {
      throw new Error(`Registry file ${label} include must be an array`)
    }
    for (const include of value.include) {
      if (
        typeof include !== "string" ||
        include.length === 0 ||
        include.trim() !== include
      ) {
        throw new Error(
          `Registry file ${label} contains an invalid include path`
        )
      }
    }
  }

  if (value.items !== undefined && !Array.isArray(value.items)) {
    throw new Error(`Registry file ${label} items must be an array`)
  }

  for (const [index, item] of (value.items ?? []).entries()) {
    if (!isRecord(item)) {
      throw new Error(`Registry item ${label}[${index}] must be an object`)
    }
    validateItemName(item.name, `Registry item ${label}[${index}]`)

    if (item.registryDependencies !== undefined) {
      if (!Array.isArray(item.registryDependencies)) {
        throw new Error(
          `Registry item ${label}[${index}] registryDependencies must be an array`
        )
      }
      for (const dependency of item.registryDependencies) {
        if (
          typeof dependency !== "string" ||
          dependency.length === 0 ||
          dependency.trim() !== dependency
        ) {
          throw new Error(
            `Registry item ${label}[${index}] contains an invalid registry dependency`
          )
        }
      }
    }
  }

  return value as RegistryDocument
}

function isWithinDirectory(rootDirectory: string, path: string): boolean {
  const pathFromRoot = relative(rootDirectory, path)
  return (
    pathFromRoot !== ".." &&
    !pathFromRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromRoot)
  )
}

export function loadRegistryGraph(rootPath = ROOT_REGISTRY): {
  files: RegistryFile[]
  items: RegistryItem[]
} {
  const resolvedRoot = resolve(rootPath)
  const rootDirectory = dirname(resolvedRoot)
  const completedFiles = new Set<string>()
  const activeFiles = new Set<string>()
  const activeStack: string[] = []
  const seenItems = new Set<string>()
  const files: RegistryFile[] = []
  const items: RegistryItem[] = []

  function visit(path: string): void {
    const resolvedPath = resolve(path)

    if (!isWithinDirectory(rootDirectory, resolvedPath)) {
      throw new Error(
        `Registry include escapes the registry root: ${resolvedPath}`
      )
    }

    if (activeFiles.has(resolvedPath)) {
      const cycleStart = activeStack.indexOf(resolvedPath)
      const cycle = [...activeStack.slice(cycleStart), resolvedPath]
        .map((entry) => graphRelative(rootDirectory, entry))
        .join(" -> ")
      throw new Error(`Registry include cycle: ${cycle}`)
    }

    if (completedFiles.has(resolvedPath)) return

    let parsed: unknown
    try {
      parsed = JSON.parse(readFileSync(resolvedPath, "utf8"))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Unable to read registry file ${graphRelative(rootDirectory, resolvedPath)}: ${message}`
      )
    }

    const document = validateRegistryDocument(
      parsed,
      resolvedPath,
      rootDirectory
    )

    activeFiles.add(resolvedPath)
    activeStack.push(resolvedPath)
    files.push({ path: resolvedPath, document })

    try {
      for (const item of document.items ?? []) {
        if (seenItems.has(item.name)) {
          throw new Error(`Duplicate registry item: ${item.name}`)
        }
        seenItems.add(item.name)
        items.push(item)
      }

      for (const include of document.include ?? []) {
        if (isAbsolute(include)) {
          throw new Error(
            `Registry include in ${graphRelative(rootDirectory, resolvedPath)} must be relative: ${include}`
          )
        }
        const includedPath = resolve(dirname(resolvedPath), include)
        if (!isWithinDirectory(rootDirectory, includedPath)) {
          throw new Error(
            `Registry include in ${graphRelative(rootDirectory, resolvedPath)} escapes the registry root: ${include}`
          )
        }
        visit(includedPath)
      }
    } finally {
      activeStack.pop()
      activeFiles.delete(resolvedPath)
    }

    completedFiles.add(resolvedPath)
  }

  visit(resolvedRoot)

  if (items.length === 0) {
    throw new Error("Registry graph contains no public items")
  }

  return { files, items }
}

function normalizeRegistryAddress(registryAddress: string): string {
  const normalized = registryAddress.replace(/\/+$/, "")
  if (
    normalized.length === 0 ||
    normalized.trim() !== normalized ||
    normalized.includes("#")
  ) {
    throw new Error(`Invalid registry address: ${registryAddress}`)
  }
  return normalized
}

export function parseInternalRegistryDependency(
  dependency: string,
  registryAddress: string
): InternalRegistryDependency | null {
  const prefix = `${normalizeRegistryAddress(registryAddress)}/`
  if (!dependency.startsWith(prefix)) return null

  const address = dependency.slice(prefix.length)
  const hashIndex = address.indexOf("#")
  const name = hashIndex >= 0 ? address.slice(0, hashIndex) : address
  const ref = hashIndex >= 0 ? address.slice(hashIndex + 1) : undefined

  validateItemName(name, `Internal registry dependency ${dependency}`)

  if (
    ref !== undefined &&
    (ref.length === 0 || ref.trim() !== ref || ref.includes("#"))
  ) {
    throw new Error(`Internal registry dependency has an invalid ref: ${dependency}`)
  }

  return ref === undefined ? { name } : { name, ref }
}

export function internalRegistryDependencyNames(
  items: RegistryItem[],
  registryAddress: string
): string[] {
  const positions = new Map<string, number>()

  for (const [index, item] of items.entries()) {
    if (positions.has(item.name)) {
      throw new Error(`Duplicate registry item: ${item.name}`)
    }
    positions.set(item.name, index)
  }

  const dependencies = new Set<string>()

  for (const [index, item] of items.entries()) {
    for (const dependency of item.registryDependencies ?? []) {
      const parsed = parseInternalRegistryDependency(
        dependency,
        registryAddress
      )
      if (!parsed) continue

      const dependencyIndex = positions.get(parsed.name)
      if (dependencyIndex === undefined) {
        throw new Error(
          `Registry item ${item.name} depends on unknown internal item ${parsed.name}`
        )
      }
      if (dependencyIndex >= index) {
        const relation = dependencyIndex === index ? "itself" : "a later item"
        throw new Error(
          `Registry item ${item.name} depends on ${relation} (${parsed.name}); internal dependencies must appear earlier in registry order`
        )
      }
      dependencies.add(parsed.name)
    }
  }

  return items
    .filter((item) => dependencies.has(item.name))
    .map((item) => item.name)
}
