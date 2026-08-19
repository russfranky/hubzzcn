# Production deployment

The production catalog is served at `https://hubzzhq.com/shadcn/` from the existing Nginx site behind Cloudflare.

## Build

```bash
npm install
npm run build:preview
```

The preview build uses the `/shadcn/` base path and writes the static site to `dist/`.

## Deploy

Run the deployment script on the production host:

```bash
./scripts/deploy-production.sh
```

The default target is:

```text
/var/www/hubzzhq.com/shadcn
```

Set `HUBZZ_SHADCN_ROOT` to override that path.

The script intentionally removes only the generated `assets/` directory before copying the new build. Other files already present in the production directory are left in place. This preserves deployment-only static files such as `ticket-bg.jpg`.

## CDN behavior

Cloudflare remains in front of the existing Nginx origin. Do not change DNS or move the `/shadcn/` route when deploying this repo.

After a production deploy, verify the existing cache behavior:

```bash
curl -I https://hubzzhq.com/shadcn/
curl -I https://hubzzhq.com/shadcn/assets/<current-hashed-asset>.js
curl -I https://hubzzhq.com/shadcn/ticket-bg.jpg
```

Expected behavior:

- HTML is revalidated rather than long-term cached.
- Hashed files under `/shadcn/assets/` receive long-lived immutable caching at the Cloudflare edge.
- `ticket-bg.jpg` keeps the existing four-hour cache lifetime.

Because asset filenames are content-hashed, a new build naturally produces new asset URLs while older cached assets remain harmless.
