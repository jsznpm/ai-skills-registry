# Mobile Performance

> Target: 60 fps (16.6 ms/frame), low memory, low battery, fast cold start.
> Optimize for low-end devices — they're the floor, not the exception.

---

## The frame budget

You have ~16.6 ms per frame at 60 fps (8.3 ms at 120 fps). Anything blocking the
UI thread longer than that drops frames ("jank").

- **React Native:** JS runs on its own thread; heavy JS or bridge traffic starves
  the UI/native thread. Keep per-frame JS small; move heavy work off the JS thread
  (native modules, `InteractionManager`, worklets via Reanimated).
- **Flutter:** UI + raster threads. Expensive `build()` methods and large
  rebuild trees cause jank. Minimize rebuild scope.

---

## Lists — the #1 perf killer

| Do NOT | Use instead |
|--------|-------------|
| `ScrollView` + `.map()` for long data | `FlatList` / `FlashList` (RN), `ListView.builder` (Flutter) |
| Inline `renderItem` | `useCallback` + `React.memo` row |
| Index as key | Stable unique `id` |
| No item layout hint | `getItemLayout` (fixed height rows) |

```tsx
const Row = React.memo(({ item }: { item: Item }) => (
  <View style={styles.row}><Text>{item.title}</Text></View>
));
const renderItem = useCallback(({ item }) => <Row item={item} />, []);

<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(i) => i.id}
  getItemLayout={(_, i) => ({ length: H, offset: H * i, index: i })}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={8}
/>
```

`FlashList` (Shopify) recycles views and usually beats `FlatList` on large/varied
lists — prefer it when available.

---

## Animations

Animate only GPU-cheap properties:

```
FAST (GPU):  transform (translate/scale/rotate), opacity
SLOW (CPU):  width, height, top/left, margin, padding  ← avoid animating
```

- **RN:** `useNativeDriver: true` always (works for transform/opacity). For
  gesture-driven or layout animation, use **Reanimated** (runs on UI thread).
- **Flutter:** prefer `AnimatedBuilder`/implicit animations; avoid rebuilding
  large subtrees each tick.

---

## Re-render discipline

**React Native**
- `React.memo` list rows and pure components.
- `useCallback`/`useMemo` for props passed down and expensive computes.
- Subscribe to slices of state, not whole stores (selectors).
- Avoid creating new object/array literals in render props.

**Flutter**
- `const` constructors everywhere possible — they skip rebuilds.
- Push state down; wrap only the part that changes (`ValueListenableBuilder`,
  `Selector`, `Consumer` with `child:` escape hatch).
- Keep `build()` cheap; no I/O or heavy compute inside it.

---

## Images

- Resize/serve at display resolution — never decode a 4000px image into a 100px
  thumbnail.
- Cache (RN: `expo-image` / FastImage; Flutter: `cached_network_image`).
- Lazy-load offscreen images; use placeholders/blurhash.
- Prefer WebP/AVIF where supported.

---

## Memory & battery

- Clean up: cancel timers, remove listeners, abort fetches on unmount
  (`useEffect` cleanup / `dispose()`).
- Batch network calls; back off polling; use push instead of polling where possible.
- Stop location/sensors when not in use (huge battery cost).
- Dark/OLED palettes cut display power on dark screens.

---

## Startup

- Defer non-critical work past first paint (`InteractionManager.runAfterInteractions`).
- Lazy-load heavy screens/routes (code splitting, deferred components).
- Trim the initial JS bundle; enable Hermes (RN) and tree-shaking.

---

## Measure, don't guess

- **RN:** Flipper / React DevTools Profiler, Hermes profiler, `performance` marks.
- **Flutter:** DevTools timeline, "Performance overlay", rebuild counts.
- Always profile a **release build on a real low-end device** — debug builds lie.
