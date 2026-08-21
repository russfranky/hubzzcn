import { readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
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

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
export const ROOT_REGISTRY = resolve(REPO_ROOT, "registry.json")

export function repoRelative(path: string): string {
  return relative(REPO_ROOT, path)
}

export function loadRegistryGraph(rootPath = ROOT_REGISTRY): {
  files: RegistryFile[]
  items: RegistryItem[]
} {
  const seenFiles = new Set<string>()
  const seenItems = new Set<string>()
  const files: RegistryFile[] = []
  const items: RegistryItem[] = []

  function visit(path: string): void {
    if (seenFiles.has(path)) return
    seenFiles.add(path)

    const document = JSON.parse(readFileSync(path, "utf8")) as RegistryDocument
    files.push({ path, document })

    for (const item of document.items ?? []) {
      if (!item.name || typeof item.name !== "string") {
        throw new Error(
          `Registry item in ${repoRelative(path)} is missing a valid name`
        )
      }
      if (seenItems.has(item.name)) {
        throw new Error(`Duplicate registry item: ${item.name}`)
      }
      seenItems.add(item.name)
      items.push(item)
    }

    for (const include of document.include ?? []) {
      visit(resolve(dirname(path), include))
    }
  }

  visit(rootPath)
  return { files, items }
}
