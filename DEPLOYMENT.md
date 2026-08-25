# Production deployment

The public catalog is served at `https://hubzz.xyz/cn/` from the existing
Nginx site behind Cloudflare.

## Build

Use the frozen pnpm lockfile and the `/cn/` preview build:

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
