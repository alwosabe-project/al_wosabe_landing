# Al-Wosabe public site

Next.js bilingual public catalog. Marketing/SEO implementation has been reviewed from source only; no local server, browser, build, compiler, tests or migration were run.

Deployment order: back up the database; apply the API's additive marketing/SEO migrations; deploy API; deploy Admin and Landing; configure providers and permissions; verify with the owner's platform tools. The API owns the delivery worker and encrypted secrets.

Copy the variable names in `.env.example` to your deployment configuration. `SITE_URL` is the server-only canonical origin. Set `SITE_INDEXABLE=true` only on the canonical production deployment and allow indexing in SEO settings. `API_URL` is used on the server and `NEXT_PUBLIC_API_URL` is the public API origin, with CORS configured on the API. Never expose provider tokens or preview signing keys through public environment variables.

`/sitemap.xml` is an index of numbered XML shards. SEO changes invalidate Next fetch tags immediately when the configured webhook succeeds. Redirect maps refresh within60 seconds; sitemap HTTP responses can be cached for300 seconds. Preview reads always bypass cache and exclude tracking.

Owner configuration, deployment and verification: `../OWNER_ACTIONS.md`. Full implementation inventory and limits: `../IMPLEMENTATION_REPORT.md`. Backend provider contracts and retention: `../al-wosabe-api/docs/MARKETING_BACKEND.md`.
