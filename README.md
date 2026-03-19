# Mochii Website

React/Vite rebuild of `https://mochii.framer.website`, migrated from Framer and prepared for Cloudflare Pages.

## Local development

```bash
npm install
npm run import:site
npm run dev
```

## Build

```bash
npm run build
```

## Re-import the live Framer source

```bash
npm run import:site
```

This fetches the current live Mochii pages, downloads the referenced images/fonts into `public/assets/imported`, and regenerates `src/content/generated/site-data.json`.

## Cloudflare Pages

This repo is set up for a static Cloudflare Pages deployment.

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20` or newer
- SPA routing: handled by `public/_redirects`

You can deploy either way:

1. Git integration
   - Connect this GitHub repo in Cloudflare Pages.
   - Set the production branch to `main`.
   - Use the build settings above.

2. Wrangler / direct deploy
   - `wrangler.toml` already sets `pages_build_output_dir = "./dist"`.
   - After building, deploy with `wrangler pages deploy dist`.
