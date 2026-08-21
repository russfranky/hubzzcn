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

- **Patch**: bug fixes, accessibility fixes, documentation corrections, and
  compatible visual fixes.
- **Minor**: new components, new compatible variants, new registry items, or
  documented pre-1.0 API evolution.
- **Major**: breaking changes after 1.0, including incompatible public APIs,
  registry item paths, or primitive-base migrations.

Before 1.0, intentional breaking changes still require migration notes even
when they ship in a minor release.

## Release steps

1. Move the relevant `CHANGELOG.md` entries out of **Unreleased** into the new
   version section.
2. Update `package.json` to the release version.
3. Pin every same-repository registry dependency to the planned release tag:

   ```bash
   pnpm release:pin-registry vX.Y.Z
   ```

4. If semantic tokens changed, regenerate the foundations registry:

   ```bash
   pnpm registry:sync
   ```

5. Run the pre-tag repository and browser gates:

   ```bash
   pnpm check
   pnpm test:ui
   ```

   Do not claim an exact tagged consumer install at this stage. The pinned
   `vX.Y.Z` dependency refs are intentionally unresolved until the tag exists
   on GitHub.

6. Commit the release metadata and pinned registry refs.
7. Create an annotated `vX.Y.Z` tag on that exact commit and push it.
8. The release workflow must then verify the tag, verify every same-repository
   dependency ref, run the full repository and browser gates, resolve the
   tagged registry, install it into a clean consumer, create checksums, attest
   the package artifact with GitHub/Sigstore provenance, and only then create
   the GitHub Release.
9. After the release workflow is green, independently verify tagged registry
   installs with the repository-locked CLI:

   ```bash
   pnpm exec shadcn view russfranky/hubzzcn/hubzz#vX.Y.Z
   pnpm exec shadcn view russfranky/hubzzcn/button#vX.Y.Z
   pnpm registry:smoke vX.Y.Z
   ```

10. Verify the public catalog after production deployment.

A pushed tag whose release workflow fails is not a completed release. Fix the
cause deliberately rather than publishing a GitHub Release around a failed
verification chain.

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
