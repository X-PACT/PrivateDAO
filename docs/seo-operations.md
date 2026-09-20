# SEO Operations

## Public surfaces

The canonical public content set is intentionally small: the homepage, buyer-facing product routes, `/research/`, `/developers/`, `/docs/`, `/architecture/`, `/networks/`, `/status/`, `/security/`, and the company/legal pages. Historical documents and internal operational routes remain available where required, but are not promoted in the public sitemap.

Every indexable route should have a canonical URL, route-specific social metadata, and initial-HTML JSON-LD where a schema is appropriate. Product routes use `SoftwareApplication`/`WebApplication`; research uses `Article`; company and homepage surfaces use `Organization` and `WebSite`; nested routes use `BreadcrumbList`.

## Search Console and Webmaster Tools

Search Console and Bing Webmaster verification/submission are external account operations. The build accepts, without committing values, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` from the production environment. Never put verification tokens in Git or client configuration outside the public verification meta tag.

Submit the canonical sitemap after release:

`https://privatedao.org/sitemap.xml`

Do not treat a submitted sitemap as proof that pages are indexed. Confirm coverage and crawl errors in each provider dashboard.

## IndexNow

IndexNow is opt-in and requires a secret key in the deployment secret store plus a public key file at the root of the canonical domain. Notify only canonical URLs:

```bash
INDEXNOW_KEY='in-secret-store' \
INDEXNOW_URLS='https://privatedao.org/confidential-payroll/ https://privatedao.org/research/' \
npm run seo:indexnow
```

The notification script validates the host and HTTPS URLs and never prints the key.
