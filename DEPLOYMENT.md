# Production deployment

The public catalog is served at `https://hubzz.xyz/cn/` from the existing
Nginx site behind Cloudflare.

## Build

Use the lockfile-backed install and the `/cn/` preview build:

```bash
npm ci
npm run build:preview
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

The deployment mirrors `dist/` into the target. When `rsync` is available it
uses `--delete` so removed build files do not remain publicly reachable. The
fallback clears the target before copying the new build.

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
