# React Performance Guidelines

The complete rule set referenced by `SKILL.md`. Rules are ordered by impact. Each
rule gives an incorrect/correct comparison, the impact, and when to apply it.

---

## 1. Eliminating Waterfalls (CRITICAL)

A waterfall is a chain of async operations that run sequentially when they could run
in parallel. Each sequential `await` adds a full round-trip of latency.

### 1.1 Defer await until needed
Don't `await` a promise until the value is actually used; start the work early, await late.

```tsx
// ❌ Blocks before the early-return branch even needs the data
const user = await fetchUser(id);
if (!isLoggedIn) return null;
return <Profile user={user} />;

// ✅ Kick off the request, await only where used
const userPromise = fetchUser(id);
if (!isLoggedIn) return null;
return <Profile user={await userPromise} />;
```
**Impact:** removes one full request latency from the unauthenticated path.

### 1.2 Dependency-based parallelization
Only serialize requests that truly depend on each other; parallelize the rest.

```tsx
// ❌ posts doesn't need user, but waits for it
const user = await fetchUser(id);
const posts = await fetchPosts();

// ✅ run independent fetches together
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts()]);
```

### 1.3 Prevent waterfall chains in API routes
In a route handler, batch independent DB/network calls instead of awaiting one by one.
**Impact:** TTFB drops from sum-of-latencies to max-of-latencies.

### 1.4 Promise.all() for independent operations
Group every set of independent async calls into a single `Promise.all` (or
`Promise.allSettled` when partial failure is acceptable).

### 1.5 Strategic Suspense boundaries
Wrap slow subtrees in `<Suspense>` so the shell streams immediately while data loads.

```tsx
<Layout>
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />        {/* streams in when ready */}
  </Suspense>
</Layout>
```

---

## 2. Bundle Size Optimization (CRITICAL)

Smaller initial JS improves TTI and LCP.

### 2.1 Avoid barrel file imports
Importing one symbol from a barrel (`index.ts` re-exporting everything) can pull the
whole module graph into the bundle if tree-shaking fails.

```tsx
// ❌ may load the entire icon set
import { Check } from 'lucide-react';
// ✅ import the exact module
import Check from 'lucide-react/dist/esm/icons/check';
```
Prefer `optimizePackageImports` in `next.config.js` where available.

### 2.2 Conditional module loading
`await import()` heavy modules only inside the branch that needs them.

### 2.3 Defer non-critical third-party libraries
Load analytics, chat widgets, and trackers after hydration / on idle — never in the
critical path.

### 2.4 Dynamic imports for heavy components
```tsx
const MonacoEditor = dynamic(() => import('./monaco-editor'), { ssr: false });
```

### 2.5 Preload based on user intent
Prefetch a route's chunk on hover/focus so navigation feels instant without bloating
the initial bundle.

---

## 3. Server-Side Performance (HIGH)

### 3.1 Cross-request LRU caching
Cache expensive computations/fetches across requests with an LRU (e.g.
`node-lru-cache`), bounded by size and TTL.

### 3.2 Minimize serialization at RSC boundaries
Only pass the fields a Client Component needs across the server→client boundary;
serializing large objects costs CPU and payload.

### 3.3 Parallel data fetching with component composition
Let sibling Server Components each fetch their own data so React renders them in
parallel rather than threading one big fetch through props.

### 3.4 Per-request deduplication with React.cache()
Wrap a fetch in `React.cache()` so multiple components requesting the same data in one
render share a single call.

```tsx
import { cache } from 'react';
export const getUser = cache((id: string) => db.user.find(id));
```

---

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

### 4.1 Deduplicate global event listeners
Register one shared `resize`/`scroll` listener and fan out, instead of N component
listeners.

### 4.2 Use SWR for automatic deduplication
SWR coalesces identical concurrent requests and caches results, with revalidation on
focus/reconnect.

```tsx
const { data } = useSWR(`/api/user/${id}`, fetcher);
```

---

## 5. Re-render Optimization (MEDIUM)

### 5.1 Defer state reads to usage point
Read context/store state in the leaf that uses it, not high in the tree where it forces
broad re-renders.

### 5.2 Extract to memoized components
Pull a frequently-rerendering subtree into a `React.memo` child with stable props.

### 5.3 Narrow effect dependencies
Depend on the specific primitive, not the whole object, to avoid effects firing on
unrelated changes.

### 5.4 Subscribe to derived state
Select the minimal derived slice (e.g. Zustand/Redux selector) so the component only
re-renders when that slice changes.

### 5.5 Use lazy state initialization
```tsx
// ❌ runs every render
const [v] = useState(expensiveInit());
// ✅ runs once
const [v] = useState(() => expensiveInit());
```

### 5.6 Use transitions for non-urgent updates
Wrap low-priority updates in `startTransition` to keep input responsive.

---

## 6. Rendering Performance (MEDIUM)

### 6.1 Animate SVG wrapper instead of SVG element
Animate a wrapping `<div transform>` to stay on the compositor instead of triggering
SVG layout.

### 6.2 CSS content-visibility for long lists
`content-visibility: auto` skips rendering off-screen items.

### 6.3 Hoist static JSX elements
Move constant JSX outside the component so it isn't recreated each render.

### 6.4 Optimize SVG precision
Trim path coordinate precision to shrink payload and parse cost.

### 6.5 Prevent hydration mismatch without flickering
Gate client-only values behind a mounted flag or `useSyncExternalStore` to avoid
mismatch warnings and visual flashes.

### 6.6 Use Activity component for show/hide
Prefer React's `<Activity>` (where available) to preserve state of hidden subtrees
without paying full unmount/remount.

### 6.7 Use explicit conditional rendering
`cond ? <A/> : null` rather than `cond && <A/>` when `cond` can be `0`/`''` and leak
into the output.

---

## 7. JavaScript Performance (LOW-MEDIUM)

Micro-optimizations — apply only on measured hot paths.

- **Batch DOM CSS changes** — write all style mutations together to avoid layout thrash.
- **Build index maps for repeated lookups** — convert arrays to `Map` keyed by id.
- **Cache property access in loops** — hoist `obj.deep.prop` and `arr.length`.
- **Cache repeated function calls** — store a pure result instead of recomputing.
- **Cache storage API calls** — read `localStorage` once, not per render.
- **Combine multiple array iterations** — one pass instead of chained `map().filter()`.
- **Early length check for array comparisons** — bail if lengths differ.
- **Early return from functions** — exit before doing unnecessary work.
- **Hoist RegExp creation** — define `const RE = /.../;` at module scope, not in render.
- **Use loop for min/max instead of sort** — O(n) vs O(n log n).
- **Use Set/Map for O(1) lookups** — replace `array.includes` in loops.
- **Use toSorted() instead of sort()** — immutable, avoids mutating shared arrays.

```tsx
// ❌ mutates the prop/state array in place
const sorted = items.sort(byDate);
// ✅ returns a new array
const sorted = items.toSorted(byDate);
```

---

## 8. Advanced Patterns (LOW)

### 8.1 Store event handlers in refs
Keep a changing handler in a ref so a subscription effect doesn't re-run on every render.

### 8.2 useLatest for stable callback refs
```tsx
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
```
Gives effects/subscriptions a stable accessor to the freshest value without re-subscribing.

---

## Applying these rules

1. Profile first (React DevTools Profiler, Lighthouse, `next build` output).
2. Fix CRITICAL categories (waterfalls, bundle) before micro-optimizations.
3. Measure each change against LCP / TTI / bundle size.
4. Don't optimize speculatively — verify the bottleneck exists.
