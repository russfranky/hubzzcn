# Production deployment

The canonical catalog target is `https://hubzz.xyz/cn/`. Russ confirmed the
`.xyz` domain decision on 2026-09-08. The existing publication path uses the
Nginx site behind Cloudflare.

## Separate deployment targets

The canonical `.xyz` catalog and the automatic Vercel deployment are separate
publication targets. Do not use a successful Vercel run, a `hubzzhq.com` alias,
or a merged commit as proof that `hubzz.xyz/cn/` received an update.

- Canonical `.xyz` catalog: `pnpm build:preview` produces the `/cn/` build;
  `scripts/deploy-production.sh` publishes it on the existing static host.
- Vercel: `.github/workflows/deploy-vercel.yml` deploys its configured project;
  its catalog build uses a different base path. This workflow does not run the
  static-host publisher.

Despite its name, `build:preview` is the production build for the canonical
`/cn/` site. Do not copy the root-based Vercel build to that directory.

This domain decision does not change DNS or hosting by itself. The existing
Vercel workflow remains unchanged. A separate hosting migration or retirement
requires an explicit plan rather than an unannounced domain substitution.

## Build

Use a reviewed commit with passing checks, the frozen pnpm lockfile, and the
`/cn/` preview build:

```bash
pnpm install --frozen-lockfile
pnpm build:preview
```

The build writes the complete static site to `dist/`.

## Deploy

Run the deployment script on the production host:

```bash
./scripts/deploy-production.sh
```

The default target is:

```text
/var/www/hubzz.xyz/cn
```

Set `HUBZZ_CN_ROOT` to override it.

`deploy-production.sh` builds the site, then delegates static publishing to
`scripts/publish-static.sh`. The publisher copies assets and other static files
first and atomically replaces `index.html` last. A newly served HTML document
therefore never references a release asset that has not been copied yet.

Old content-addressed assets are intentionally retained during deployment. An
already-open page may still request a previous hashed asset after a new index
has become current, so deleting old assets in the same release operation would
create an avoidable race. Asset cleanup is a separate maintenance concern and
must not be coupled to publishing the new entry document.

The dependency-first publisher is exercised by `pnpm deployment:smoke`, which
runs as part of the normal repository `pnpm check` gate.

All runtime assets used by the catalog should be versioned in this repository.
Production-only files are not part of the component contract.

## CDN behavior

Cloudflare remains in front of the existing `hubzz.xyz` Nginx origin. DNS does
not change for catalog releases.

After deployment, verify:

```bash
curl -I https://hubzz.xyz/cn/
curl -I https://hubzz.xyz/cn/assets/<current-hashed-asset>.js
```

Expected behavior:

- HTML is revalidated rather than long-term cached.
- Hashed files under `/cn/assets/` receive long-lived immutable caching at the
  Cloudflare edge.

Content-hashed asset names allow new releases to roll out without purging old
JS or CSS URLs.

## Canonical release evidence

A successful HTTP status alone does not identify the deployed revision. Record:

1. The exact checked commit from the production checkout (`git rev-parse HEAD`).
2. The result of the static-host publication for that checkout.
3. The canonical HTML and its referenced JS/CSS asset paths, compared with the
   corresponding `dist/index.html` build output.
4. Browser checks at `https://hubzz.xyz/cn/` and the affected prototype route,
   including a direct route load and refresh.

Report merge, CI, static-host publication, and canonical browser verification
as separate results. If host access or canonical-site access is unavailable,
record that limit and the next action in `docs/WORKING_STATE.md`; do not mark
`.xyz` publication complete based on a different deployment target.
