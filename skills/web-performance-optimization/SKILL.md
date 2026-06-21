---
name: web-performance-optimization
description: "Optimize website and web application performance including loading speed, Core Web Vitals, bundle size, caching strategies, and runtime performance"
---

# Web Performance Optimization

## Overview

Help developers optimize website and web application performance to improve user experience, SEO rankings, and conversion rates. This skill provides systematic approaches to measure, analyze, and improve loading speed, runtime performance, and Core Web Vitals metrics.

## When to Use This Skill

- Use when website or app is loading slowly
- Use when optimizing for Core Web Vitals (LCP, FID, CLS)
- Use when reducing JavaScript bundle size
- Use when improving Time to Interactive (TTI)
- Use when optimizing images and assets
- Use when implementing caching strategies
- Use when debugging performance bottlenecks
- Use when preparing for performance audits

## How It Works

### Step 1: Measure Current Performance

I'll help you establish baseline metrics:
- Run Lighthouse audits
- Measure Core Web Vitals (LCP, FID, CLS)
- Check bundle sizes
- Analyze network waterfall
- Identify performance bottlenecks

### Step 2: Identify Issues

Analyze performance problems:
- Large JavaScript bundles
- Unoptimized images
- Render-blocking resources
- Slow server response times
- Missing caching headers
- Layout shifts
- Long tasks blocking main thread

### Step 3: Prioritize Optimizations

Focus on high-impact improvements:
- Critical rendering path optimization
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Third-party script optimization

### Step 4: Implement Optimizations

Apply performance improvements:
- Optimize assets (images, fonts, CSS, JS)
- Implement code splitting
- Add caching headers
- Lazy load non-critical resources
- Optimize critical rendering path

### Step 5: Verify Improvements

Measure impact of changes:
- Re-run Lighthouse audits
- Compare before/after metrics
- Monitor real user metrics (RUM)
- Test on different devices and networks

## Examples

### Example 1: Optimizing Core Web Vitals

```markdown
## Performance Audit Results

### Current Metrics (Before Optimization)
- **LCP (Largest Contentful Paint):** 4.2s ❌ (should be < 2.5s)
- **FID (First Input Delay):** 180ms ❌ (should be < 100ms)
- **CLS (Cumulative Layout Shift):** 0.25 ❌ (should be < 0.1)
- **Lighthouse Score:** 62/100

### Issues Identified

1. **LCP Issue:** Hero image (2.5MB) loads slowly
2. **FID Issue:** Large JavaScript bundle (850KB) blocks main thread
3. **CLS Issue:** Images without dimensions cause layout shifts
```

#### Fix LCP (Largest Contentful Paint)

**Problem:** Hero image is 2.5MB and loads slowly

```html
<!-- Before: Unoptimized image -->
<img src="/hero.jpg" alt="Hero">

<!-- After: Optimized with modern formats -->
<picture>
  <source srcset="/hero.avif" type="image/avif">
  <source srcset="/hero.webp" type="image/webp">
  <img
    src="/hero.jpg"
    alt="Hero"
    width="1200"
    height="600"
    loading="eager"
    fetchpriority="high"
  >
</picture>
```

**Additional optimizations:**
- Compress image to < 200KB
- Use CDN for faster delivery
- Preload hero image: `<link rel="preload" as="image" href="/hero.avif">`

#### Fix FID (First Input Delay)

**Problem:** 850KB JavaScript bundle blocks main thread

1. **Code Splitting:**
```javascript
// Before: Everything in one bundle
import { HeavyComponent } from './HeavyComponent';
import { Analytics } from './analytics';
import { ChatWidget } from './chat';

// After: Lazy load non-critical code
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const ChatWidget = lazy(() => import('./chat'));

// Load analytics after page interactive
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    import('./analytics').then(({ Analytics }) => {
      Analytics.init();
    });
  });
}
```

2. **Remove Unused Dependencies:**
```bash
# Analyze bundle
npx webpack-bundle-analyzer

# Remove unused packages
npm uninstall moment  # Use date-fns instead (smaller)
npm install date-fns
```

3. **Defer Non-Critical Scripts:**
```html
<!-- Before: Blocks rendering -->
<script src="/analytics.js"></script>

<!-- After: Deferred -->
<script src="/analytics.js" defer></script>
```

#### Fix CLS (Cumulative Layout Shift)

**Problem:** Images without dimensions cause layout shifts

```html
<!-- Before: No dimensions -->
<img src="/product.jpg" alt="Product">

<!-- After: With dimensions -->
<img
  src="/product.jpg"
  alt="Product"
  width="400"
  height="300"
  style="aspect-ratio: 4/3;"
>
```

**For dynamic content:**
```css
/* Reserve space for content that loads later */
.skeleton-loader {
  min-height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Results After Optimization:** LCP 1.8s ✅, FID 45ms ✅, CLS 0.05 ✅, Lighthouse 94/100 ✅

### Example 2: Reducing JavaScript Bundle Size

```bash
# Analyze bundle composition
npx webpack-bundle-analyzer dist/stats.json
```

**Common findings:** Moment.js (67KB → date-fns 12KB), full Lodash import (72KB), dead code (~150KB), no code splitting.

#### 1. Replace Heavy Dependencies

```javascript
// Before
import moment from 'moment';
const formatted = moment(date).format('YYYY-MM-DD');

// After
import { format } from 'date-fns';
const formatted = format(date, 'yyyy-MM-dd');
```

#### 2. Use Lodash Selectively

```javascript
// Before: Import entire library (72KB)
import _ from 'lodash';
const unique = _.uniq(array);

// After: Import only what you need (5KB)
import uniq from 'lodash/uniq';
const unique = uniq(array);

// Or use native methods
const unique = [...new Set(array)];
```

#### 3. Implement Code Splitting

```javascript
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false
});
```

#### 4. Remove Dead Code (tree shaking)

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: { usedExports: true, sideEffects: false }
};
// package.json: { "sideEffects": false }
```

### Example 3: Image Optimization Strategy

#### Convert to Modern Formats

```javascript
// optimize-images.js
const sharp = require('sharp');
const path = require('path');

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  await sharp(inputPath).webp({ quality: 80 }).toFile(path.join(outputDir, `${filename}.webp`));
  await sharp(inputPath).avif({ quality: 70 }).toFile(path.join(outputDir, `${filename}.avif`));
  await sharp(inputPath).jpeg({ quality: 80, progressive: true }).toFile(path.join(outputDir, `${filename}.jpg`));
}
```

#### Responsive Images

```html
<picture>
  <source srcset="/images/hero-400.avif 400w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
    type="image/avif" sizes="(max-width: 768px) 100vw, 50vw">
  <source srcset="/images/hero-400.webp 400w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
    type="image/webp" sizes="(max-width: 768px) 100vw, 50vw">
  <img src="/images/hero-800.jpg"
    srcset="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w, /images/hero-1200.jpg 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="Hero image" width="1200" height="600" loading="lazy">
</picture>
```

#### Next.js Image Component

```javascript
import Image from 'next/image';

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority quality={80} />
<Image src="/product.jpg" alt="Product" width={400} height={300} loading="lazy" />
```

## Best Practices

### Do This

- **Measure First** - Establish baseline metrics before optimizing
- **Use Lighthouse** - Run audits regularly to track progress
- **Optimize Images** - Use modern formats (WebP, AVIF) and responsive images
- **Code Split** - Break large bundles into smaller chunks
- **Lazy Load** - Defer non-critical resources
- **Cache Aggressively** - Set proper cache headers for static assets
- **Minimize Main Thread Work** - Keep JavaScript execution under 50ms chunks
- **Preload Critical Resources** - Use `<link rel="preload">` for critical assets
- **Use CDN** - Serve static assets from CDN for faster delivery
- **Monitor Real Users** - Track Core Web Vitals from real users

### Don't Do This

- **Don't Optimize Blindly** - Measure first, then optimize
- **Don't Ignore Mobile** - Test on real mobile devices and slow networks
- **Don't Block Rendering** - Avoid render-blocking CSS and JavaScript
- **Don't Load Everything Upfront** - Lazy load non-critical resources
- **Don't Forget Dimensions** - Always specify image width/height
- **Don't Use Synchronous Scripts** - Use async or defer attributes
- **Don't Ignore Third-Party Scripts** - They often cause performance issues
- **Don't Skip Compression** - Always compress and minify assets

## Common Pitfalls

### Problem: Optimized for Desktop but Slow on Mobile
**Solution:** Test on real mobile devices, use DevTools throttling, optimize for 3G/4G, reduce JS execution time.
```bash
lighthouse https://yoursite.com --throttling.cpuSlowdownMultiplier=4
```

### Problem: Large JavaScript Bundle
**Solution:** Analyze with webpack-bundle-analyzer, remove unused deps, code split, lazy load.

### Problem: Images Causing Layout Shifts
**Solution:** Always specify width/height; use aspect-ratio; reserve space with skeleton loaders.
```css
img { aspect-ratio: 16 / 9; width: 100%; height: auto; }
```

### Problem: Slow Server Response Time (high TTFB)
**Solution:** Server-side caching, CDN, optimize DB queries, consider SSG.
```javascript
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}
```

## Performance Checklist

### Images
- [ ] Convert to modern formats (WebP, AVIF)
- [ ] Implement responsive images
- [ ] Add lazy loading
- [ ] Specify dimensions (width/height)
- [ ] Compress images (< 200KB each)
- [ ] Use CDN for delivery

### JavaScript
- [ ] Bundle size < 200KB (gzipped)
- [ ] Implement code splitting
- [ ] Lazy load non-critical code
- [ ] Remove unused dependencies
- [ ] Minify and compress
- [ ] Use async/defer for scripts

### CSS
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Remove unused CSS
- [ ] Minify CSS files
- [ ] Use CSS containment

### Caching
- [ ] Set cache headers for static assets
- [ ] Implement service worker
- [ ] Use CDN caching
- [ ] Cache API responses
- [ ] Version static assets

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms
- [ ] TTI < 3.8s

## Performance Tools

- **Measurement:** Lighthouse, WebPageTest, Chrome DevTools, PageSpeed Insights, Web Vitals Extension
- **Analysis:** webpack-bundle-analyzer, source-map-explorer, Bundlephobia, ImageOptim
- **Monitoring:** Google Analytics, Sentry, New Relic, Datadog

## Related Skills

- `@react-best-practices` - React performance patterns
- `@senior-frontend` - Frontend development standards
- `@seo-optimizer` - SEO and Core Web Vitals
- `@senior-architect` - Architecture for performance

## Additional Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [MDN Performance Guide](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**Pro Tip:** Focus on Core Web Vitals (LCP, FID, CLS) first — they have the biggest impact on user experience and SEO rankings.
