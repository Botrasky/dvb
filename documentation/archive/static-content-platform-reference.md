# Static Content Platform Architecture Reference

Status: reference material for the ZEUS portfolio refactor. This is not the
current production architecture and does not override `MIGRATION_PLAN.md`.

## Reference architecture

```text
                 [ Content Sources ]
        Markdown / MDX / Headless CMS / RSS
                         |
                         v
              [ Git and CI/CD Build ]
             GitHub Actions / Hosting CI
                         |
       +-----------------+-----------------+
       |          Astro Build Engine       |
       |  - Content collections and Zod    |
       |  - Generated routes               |
       |  - Image optimization and feeds   |
       +-----------------+-----------------+
                         |
                         v
              [ Edge CDN / Hosting ]
              Vercel / Cloudflare / Netlify
                         |
       +-----------------+-----------------+
       |                 |                 |
       v                 v                 v
  Static content    Interactive UI    External services
  HTML and CSS      Small islands     News, forms, analytics
```

## Recommendations worth adopting

- Keep educational content in typed Astro content collections.
- Render static HTML by default and ship JavaScript only for real interactions.
- Keep interactive behavior isolated: theme controls, search, slideshows, and
  charts should not force the rest of a page to hydrate.
- Generate search data from published content; evaluate Pagefind before adding
  a custom search backend.
- Optimize local images through Astro's current image APIs.
- Use GitHub checks and Vercel previews as release gates.

## ZEUS-specific decisions

- Keep Vercel server output while `/api/security-brief` fetches live publisher
  data at request time. A fully static build would make this feed stale between
  deployments.
- Fetching RSS only at build time is therefore not the current target.
- React, Vue, or Svelte are not required for the existing interactions. Astro
  components plus small TypeScript or JavaScript modules remain simpler.
- Vercel remains the selected host. Cloudflare Pages is a relevant alternative,
  not part of the current migration.
- `@astrojs/image` is an older recommendation. Follow the image APIs documented
  for the installed Astro version instead.

## Search option for later

Pagefind is relevant if the writeup library becomes large enough to need
full-text search. It can index generated static content without a database.
The current filters can remain until that need is clear.

## Verified references

Checked on 2026-11-11. All links were reachable and relevant:

- [Astro](https://astro.build/) — framework overview and current release links.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — schemas, loaders, Markdown/MDX content, and collection APIs.
- [Vercel: What is Astro?](https://vercel.com/i/what-is-astro) — relevant platform overview; supplementary to official Astro and Vercel deployment documentation.
- [Pagefind](https://pagefind.app/) — static search indexing and browser search UI.
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) — relevant hosting alternative with an Astro framework guide.

## Relationship to the migration plan

This reference strengthens the organization proposed in `MIGRATION_PLAN.md`:
typed writeups, reusable components, minimal client JavaScript, asset
optimization, and CI/CD gates. Its fully static news-feed recommendation is the
main point that does not match the current ZEUS requirement for live threat
updates.
