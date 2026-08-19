# Production deployment

The production catalog is served at `https://hubzz.xyz/cn/` from the existing Nginx site behind Cloudflare.

## Build

```bash
npm install
npm run build:preview
```

The preview build uses the `/cn/` base path and writes the static site to `dist/`.

## Deploy

Run the deployment script on the production host:

```bash
./scripts/deploy-production.sh
```

The default target is:

```text
/var/www/hubzz.xyz/cn
```

Set `HUBZZ_CN_ROOT` to override that path.

On the first migration deploy, the script copies the deployment-only `ticket-bg.jpg` from `/var/www/hubzzhq.com/shadcn` when the new target does not already have it. The script then removes only the generated `assets/` directory before copying the new build, so other static files remain in place.

## CDN behavior

Cloudflare remains in front of the existing `hubzz.xyz` Nginx origin. DNS does not need to change for this deployment.

After a production deploy, verify the existing cache behavior:

```bash
curl -I https://hubzz.xyz/cn/
curl -I https://hubzz.xyz/cn/assets/<current-hashed-asset>.js
curl -I https://hubzz.xyz/cn/ticket-bg.jpg
```

Expected behavior:

- HTML is revalidated rather than long-term cached.
- Hashed files under `/cn/assets/` receive long-lived immutable caching at the Cloudflare edge.
- `ticket-bg.jpg` keeps the existing four-hour cache lifetime.

Because asset filenames are content-hashed, a new build naturally produces new asset URLs while older cached assets remain harmless.
