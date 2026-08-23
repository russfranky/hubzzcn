import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, test } from "node:test"

import {
  internalRegistryDependencyNames,
  loadRegistryGraph,
  parseInternalRegistryDependency,
} from "./registry-graph"

const REGISTRY_ADDRESS = "russfranky/hubzzcn"
const tempDirectories = new Set<string>()

afterEach(() => {
  for (const directory of tempDirectories) {
    rmSync(directory, { recursive: true, force: true })
  }
  tempDirectories.clear()
})

function createTempDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "hubzz-registry-graph-"))
  tempDirectories.add(directory)
  return directory
}

function writeDocument(
  directory: string,
  path: string,
  document: unknown
): void {
  const target = join(directory, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify(document))
}

function createFixture(documents: Record<string, unknown>): string {
  const directory = createTempDirectory()
  for (const [path, document] of Object.entries(documents)) {
    writeDocument(directory, path, document)
  }
  return join(directory, "registry.json")
}

test("current repository registry graph is internally consistent", () => {
  const { items } = loadRegistryGraph()
  assert.ok(items.length > 0)
  assert.doesNotThrow(() =>
    internalRegistryDependencyNames(items, REGISTRY_ADDRESS)
  )
})

test("loads a shared include once without treating a DAG as a cycle", () => {
  const root = createFixture({
    "registry.json": { include: ["a.json", "b.json"] },
    "a.json": {
      items: [{ name: "base" }],
      include: ["shared.json"],
    },
    "b.json": {
      items: [
        {
          name: "leaf",
          registryDependencies: [`${REGISTRY_ADDRESS}/shared`],
        },
      ],
      include: ["shared.json"],
    },
    "shared.json": { items: [{ name: "shared" }] },
  })

  const graph = loadRegistryGraph(root)
  assert.deepEqual(
    graph.items.map((item) => item.name),
    ["base", "shared", "leaf"]
  )
  assert.equal(graph.files.length, 4)
  assert.deepEqual(
    internalRegistryDependencyNames(graph.items, REGISTRY_ADDRESS),
    ["shared"]
  )
})

test("rejects duplicate item names across registry files", () => {
  const root = createFixture({
    "registry.json": { include: ["a.json", "b.json"] },
    "a.json": { items: [{ name: "duplicate" }] },
    "b.json": { items: [{ name: "duplicate" }] },
  })

  assert.throws(
    () => loadRegistryGraph(root),
    /Duplicate registry item: duplicate/
  )
})

test("rejects include cycles with the cycle path", () => {
  const root = createFixture({
    "registry.json": { include: ["a.json"] },
    "a.json": { include: ["registry.json"], items: [{ name: "a" }] },
  })

  assert.throws(
    () => loadRegistryGraph(root),
    /Registry include cycle: registry\.json -> a\.json -> registry\.json/
  )
})

test("rejects includes that escape the registry root", () => {
  const root = createFixture({
    "registry.json": { include: ["../outside.json"] },
  })

  assert.throws(() => loadRegistryGraph(root), /escapes the registry root/)
})

test("rejects absolute include paths", () => {
  const directory = createTempDirectory()
  const absoluteInclude = join(directory, "a.json")
  writeDocument(directory, "a.json", { items: [{ name: "a" }] })
  writeDocument(directory, "registry.json", { include: [absoluteInclude] })

  assert.throws(
    () => loadRegistryGraph(join(directory, "registry.json")),
    /must be relative/
  )
})

test("rejects malformed registry document arrays", () => {
  const invalidInclude = createFixture({
    "registry.json": { include: "a.json" },
  })
  assert.throws(
    () => loadRegistryGraph(invalidInclude),
    /include must be an array/
  )

  const invalidItems = createFixture({
    "registry.json": { items: { name: "a" } },
  })
  assert.throws(() => loadRegistryGraph(invalidItems), /items must be an array/)

  const invalidDependencies = createFixture({
    "registry.json": {
      items: [{ name: "a", registryDependencies: ["utils", 42] }],
    },
  })
  assert.throws(
    () => loadRegistryGraph(invalidDependencies),
    /contains an invalid registry dependency/
  )
})

test("rejects invalid item names and an empty public graph", () => {
  const invalidName = createFixture({
    "registry.json": { items: [{ name: "bad/name" }] },
  })
  assert.throws(
    () => loadRegistryGraph(invalidName),
    /invalid registry item name/
  )

  const empty = createFixture({ "registry.json": { items: [] } })
  assert.throws(() => loadRegistryGraph(empty), /contains no public items/)
})

test("parses unpinned and pinned internal registry dependencies", () => {
  assert.deepEqual(
    parseInternalRegistryDependency(
      `${REGISTRY_ADDRESS}/button`,
      REGISTRY_ADDRESS
    ),
    { name: "button" }
  )
  assert.deepEqual(
    parseInternalRegistryDependency(
      `${REGISTRY_ADDRESS}/button#feature/foo`,
      REGISTRY_ADDRESS
    ),
    { name: "button", ref: "feature/foo" }
  )
  assert.equal(parseInternalRegistryDependency("utils", REGISTRY_ADDRESS), null)
})

test("rejects malformed internal registry dependency addresses", () => {
  assert.throws(
    () =>
      parseInternalRegistryDependency(`${REGISTRY_ADDRESS}/`, REGISTRY_ADDRESS),
    /invalid registry item name/
  )
  assert.throws(
    () =>
      parseInternalRegistryDependency(
        `${REGISTRY_ADDRESS}/button/extra`,
        REGISTRY_ADDRESS
      ),
    /invalid registry item name/
  )
  assert.throws(
    () =>
      parseInternalRegistryDependency(
        `${REGISTRY_ADDRESS}/button#ref#extra`,
        REGISTRY_ADDRESS
      ),
    /invalid ref/
  )
  assert.throws(
    () =>
      parseInternalRegistryDependency(
        `${REGISTRY_ADDRESS}/button#`,
        REGISTRY_ADDRESS
      ),
    /invalid ref/
  )
})

test("rejects unknown, self, and forward internal dependencies", () => {
  assert.throws(
    () =>
      internalRegistryDependencyNames(
        [
          { name: "base" },
          {
            name: "leaf",
            registryDependencies: [`${REGISTRY_ADDRESS}/missing`],
          },
        ],
        REGISTRY_ADDRESS
      ),
    /depends on unknown internal item missing/
  )

  assert.throws(
    () =>
      internalRegistryDependencyNames(
        [
          {
            name: "self",
            registryDependencies: [`${REGISTRY_ADDRESS}/self`],
          },
        ],
        REGISTRY_ADDRESS
      ),
    /depends on itself/
  )

  assert.throws(
    () =>
      internalRegistryDependencyNames(
        [
          {
            name: "dependent",
            registryDependencies: [`${REGISTRY_ADDRESS}/later`],
          },
          { name: "later" },
        ],
        REGISTRY_ADDRESS
      ),
    /depends on a later item/
  )
})
