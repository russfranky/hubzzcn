# Releasing

Hubzz UI uses Semantic Versioning and Git tags as the stable public boundary
for both the GitHub source registry and the compiled package artifact.

## Release requirements

A release starts from a clean `main` commit with the required quality,
registry, browser, accessibility, and CodeQL checks passing.

Run the local gates before preparing release metadata:

```bash
pnpm check
pnpm test:ui
pnpm registry:smoke main
```

`pnpm check` also verifies that the generated foundations registry still
matches the canonical semantic tokens in `src/index.css`.

## Versioning

- **Patch**: bug fixes, accessibility fixes, documentation corrections, and compatible visual fixes.
- **Minor**: new components, new compatible variants, new registry items, or documented pre-1.0 API evolution.
- **Major**: breaking changes after 1.0, including incompatible public APIs, registry item paths, or primitive-base migrations.

Before 1.0, intentional breaking changes still require migration notes even
when they ship in a minor release.

## Release steps

1. Move the relevant `CHANGELOG.md` entries out of **Unreleased** into the new version section.
2. Update `package.json` to the release version.
3. Pin every same-repository registry dependency to the release tag:

```bash
pnpm release:pin-registry vX.Y.Z
```

4. If semantic tokens changed, regenerate the foundations registry:

```bash
pnpm registry:sync
```

5. Run the complete gates again:

```bash
pnpm check
pnpm test:ui
pnpm registry:smoke vX.Y.Z
```

   Before the tag exists, use the full release commit SHA for the smoke test.

6. Commit the release metadata and pinned registry refs.
7. Create an annotated `vX.Y.Z` tag on that exact commit and push it.
8. Let the release workflow verify the tag, verify pinned dependency refs, run the full gates, create checksums, attest the package artifact with GitHub/Sigstore provenance, and create the GitHub Release.
9. Verify tagged registry installs:

```bash
pnpm dlx shadcn@latest view russfranky/hubzzcn/hubzz#vX.Y.Z
pnpm dlx shadcn@latest view russfranky/hubzzcn/button#vX.Y.Z
```

10. Verify the public catalog after production deployment.

## Registry compatibility

Refs are not inherited across GitHub registry dependencies. Release commits
therefore pin every Hubzz-to-Hubzz registry dependency to the same tag. The
release workflow refuses to publish if any same-repository dependency is
floating.

Published documentation should prefer tagged registry addresses:

```text
russfranky/hubzzcn/hubzz#vX.Y.Z
russfranky/hubzzcn/button#vX.Y.Z
```

Development documentation may use unpinned addresses only when it is explicitly
describing the latest `main` source.

## Package publishing

The repository builds and attests a package-compatible `@hubzz/ui` artifact,
but npm publication is intentionally not configured. The GitHub source registry
is the canonical public distribution channel. If npm publication is introduced,
use npm trusted publishing with OIDC rather than a long-lived automation token.
