# Releasing

Hubzz UI uses Semantic Versioning and Git tags as the stable public boundary
for both the source registry and the package build.

## Release requirements

A release must start from a clean `main` commit where all required checks pass:

```bash
pnpm check
pnpm test:ui
```

The registry must also resolve at the exact commit being released:

```bash
pnpm dlx shadcn@latest registry validate russfranky/hubzzcn#<commit-sha>
pnpm dlx shadcn@latest view russfranky/hubzzcn/hubzz#<commit-sha>
```

## Versioning

- **Patch**: bug fixes, accessibility fixes, documentation corrections, and compatible visual fixes.
- **Minor**: new components, new compatible variants, new registry items, or documented pre-1.0 API evolution.
- **Major**: breaking changes after 1.0, including incompatible public APIs, registry item paths, or primitive-base migrations.

Before 1.0, intentional breaking changes still require migration notes even
when they ship in a minor release.

## Release steps

1. Update `CHANGELOG.md` by moving relevant entries from **Unreleased** into a versioned section.
2. Update `package.json` to the release version.
3. Run the full checks.
4. Commit the release metadata.
5. Create an annotated `vX.Y.Z` tag on that commit and push it.
6. Let the release workflow validate the tag and create the GitHub Release.
7. Verify pinned registry installs using the tag:

```bash
pnpm dlx shadcn@latest view russfranky/hubzzcn/hubzz#vX.Y.Z
pnpm dlx shadcn@latest view russfranky/hubzzcn/button#vX.Y.Z
```

8. Verify the public catalog after deployment.

## Registry compatibility

Published documentation should prefer tagged registry addresses for
reproducible production installs:

```text
russfranky/hubzzcn/hubzz#vX.Y.Z
russfranky/hubzzcn/button#vX.Y.Z
```

Development documentation may use the unpinned `main` address when it is
explicitly describing the latest source.

## Package publishing

The repository builds a package-compatible `@hubzz/ui` artifact, but package
publication is a separate release channel. Do not add a package-registry
publish step until the destination, access policy, and credentials are
intentionally configured.
