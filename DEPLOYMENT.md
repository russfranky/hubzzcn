# Production deployment

Use the existing `hubzz-ui` Vercel production project.

**Working catalog:** `https://hubzz-ui-phi.vercel.app/`

Russ dropped the `.xyz` requirement on 2026-09-09. No custom-domain migration,
Cloudflare access, or Nginx publication is required for current product work.
This supersedes the domain requirement recorded in PR #88. Leave the old site,
DNS, and existing Vercel aliases unchanged unless separately requested.

## Normal release

1. Review a focused PR and confirm its exact head passes the required checks.
2. Merge the PR into `main` under the standing merge-after-checks preference.
3. Verify the `Deploy Vercel Production` workflow for that merge commit.
4. Confirm the production deployment is `READY` and its Git SHA matches.
5. Check the affected interface at the working Vercel URL and record the result.

The existing `.github/workflows/deploy-vercel.yml` runs on pushes to `main`.
It uses the configured production environment, pulls the Vercel settings,
builds, and deploys the prebuilt output. Keep credentials in the existing
secret store; no additional service access is needed for this release path.

`vercel.json` selects `pnpm build:vercel` and the `dist/` output. This build
uses root-relative assets. The catalog is at `/`; the existing rewrite paths
include `/cn`, `/cn/portal`, and `/cn/stage`. MQS is at `/?prototype=mqs`.
Do not copy the legacy `/cn/` static-host build over the Vercel output.

For a local production-build check:

```bash
pnpm install --frozen-lockfile
pnpm build:vercel
pnpm preview
```

Record merge, CI, deployment, and browser results separately in the PR.
A deployment status is not a browser test. Neither result requires checking
`.xyz`, which is no longer an active release target.

## Legacy static host — inactive reference

The older `hubzz.xyz/cn/` site used Nginx behind Cloudflare. Its publication
procedure remains below to explain the retained scripts, not as a current
release task. Do not run it or request access unless Russ reopens that work.

### Legacy build and publication

The legacy build uses `pnpm build:preview`, which writes `/cn/`-based assets
to `dist/`. `scripts/deploy-production.sh` builds that output on the static
host and publishes to `/var/www/hubzz.xyz/cn` by default. `HUBZZ_CN_ROOT`
overrides that directory.

The deployment script delegates publication to `scripts/publish-static.sh`.
The publisher copies assets and other static files first, then atomically
replaces `index.html`. It retains old hashed assets because already-open
pages can still reference them. Asset cleanup must remain separate from
publication.

`pnpm deployment:smoke` exercises the dependency-first publisher as part of
`pnpm check`. Retain that test and the legacy scripts; abandoning a domain
requirement does not authorize deleting tested publication utilities.

### Legacy cache and release evidence

The intended static-host cache behavior is revalidated HTML and long-lived
immutable hashed files under `/cn/assets/`. Content-hashed asset names avoid
the need to purge old JS or CSS URLs during a release.

If this host is explicitly reactivated, record the checked commit, publication
result, served HTML and asset paths compared with the matching build, and
browser results for direct route loads and refreshes. An HTTP 200 alone does
not identify a deployed revision. Until reactivation, none of these legacy
host checks block a Vercel release or product work.
