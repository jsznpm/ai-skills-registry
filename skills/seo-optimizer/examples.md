# SEO Optimizer — Examples

## Example 1: Rewrite a weak title + meta description

**Before**
```html
<title>Blog</title>
<meta name="description" content="Our blog">
```

**After**
```html
<title>React Performance Guide: 9 Proven Speed Fixes (2026)</title>
<meta name="description" content="Cut React load time fast. 9 battle-tested fixes for re-renders, bundle size, and Core Web Vitals — with copy-paste code. Start optimizing today.">
```
Title under 60 chars, keyword first, year for freshness. Description 150–160 chars, benefit + CTA.

## Example 2: Add Article schema to a blog post

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "React Performance Guide: 9 Proven Speed Fixes",
  "datePublished": "2026-06-17",
  "dateModified": "2026-06-17",
  "author": { "@type": "Person", "name": "Jane Developer" }
}
</script>
```

## Example 3: Fix Cumulative Layout Shift (CLS)

**Problem:** images without dimensions push content down on load.

**Before**
```html
<img src="/hero.webp" alt="dashboard">
```

**After**
```html
<img src="/hero.webp" alt="Analytics dashboard overview" width="1200" height="630" loading="lazy">
```
Explicit `width`/`height` reserve space → CLS drops below 0.1.

## Example 4: Keyword-to-page mapping

| Keyword | Intent | Target page | Type |
|---------|--------|-------------|------|
| "what is server side rendering" | Informational | /blog/ssr-explained | Article |
| "next.js hosting" | Commercial | /pricing | Landing |
| "buy next.js template" | Transactional | /templates | Product |

## Example 5: Audit checklist run on a page

```
[ ✓ ] Title 54 chars, keyword first
[ ✗ ] Meta description missing → add 150–160 char description
[ ✓ ] Single H1 with primary keyword
[ ✗ ] 3 images missing alt text → add descriptive alt
[ ✓ ] Canonical tag present
[ ✗ ] LCP 4.1s → preload hero image, compress to WebP
```
