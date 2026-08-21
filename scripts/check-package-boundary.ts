import { existsSync, readFileSync } from "node:fs"
import { dirname, extname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ENTRY = resolve(REPO_ROOT, "src/index.ts")
const packageJson = JSON.parse(
  readFileSync(resolve(REPO_ROOT, "package.json"), "utf8")
) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx"]
const visited = new Set<string>()
const externalPackages = new Set<string>()

function packageName(specifier: string): string {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/")
  }
  return specifier.split("/", 1)[0]
}

function resolveSource(fromFile: string, specifier: string): string | null {
  if (specifier.endsWith(".css")) return null

  const base = specifier.startsWith("@/")
    ? resolve(REPO_ROOT, "src", specifier.slice(2))
    : resolve(dirname(fromFile), specifier)

  const candidates = extname(base)
    ? [base]
    : [
        base,
        ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) =>
          resolve(base, `index${extension}`)
        ),
      ]

  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

function visit(file: string): void {
  if (visited.has(file)) return
  visited.add(file)

  const source = readFileSync(file, "utf8")
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )

  for (const statement of sourceFile.statements) {
    const moduleSpecifier =
      (ts.isImportDeclaration(statement) ||
        ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null

    if (!moduleSpecifier) continue

    if (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("@/")) {
      const resolved = resolveSource(file, moduleSpecifier)
      if (!resolved) {
        if (!moduleSpecifier.endsWith(".css")) {
          throw new Error(
            `Could not resolve ${moduleSpecifier} imported by ${file.replace(`${REPO_ROOT}/`, "")}`
          )
        }
        continue
      }
      visit(resolved)
      continue
    }

    externalPackages.add(packageName(moduleSpecifier))
  }
}

visit(ENTRY)

const peerDependencies = new Set(
  Object.keys(packageJson.peerDependencies ?? {})
)
const requiredDependencies = [...externalPackages]
  .filter((dependency) => !peerDependencies.has(dependency))
  .sort()
const declaredDependencies = Object.keys(packageJson.dependencies ?? {}).sort()

const missing = requiredDependencies.filter(
  (dependency) => !declaredDependencies.includes(dependency)
)
const extra = declaredDependencies.filter(
  (dependency) => !requiredDependencies.includes(dependency)
)

if (missing.length || extra.length) {
  console.error(
    "Package runtime dependencies do not match the src/index.ts import closure."
  )
  if (missing.length) {
    console.error(`Missing dependencies: ${missing.join(", ")}`)
  }
  if (extra.length) {
    console.error(`Repository-only dependencies: ${extra.join(", ")}`)
  }
  process.exit(1)
}

console.log(
  `✓ package runtime dependency boundary — ${requiredDependencies.join(", ")}`
)
