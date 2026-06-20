# Mobile Navigation

> Navigation is information architecture made physical. Pick the pattern that
> matches the app's structure and how often users switch contexts.

---

## Pattern selection

| Pattern | Use when | Avoid when |
|---------|----------|------------|
| **Bottom tabs** | 2–5 top-level, equally-important, frequently-switched destinations | 6+ destinations; hierarchical content |
| **Stack** | Drill-down flows (list → detail → edit) | As the only top-level switcher |
| **Drawer** | Many secondary destinations, settings, account switch | Primary frequent navigation (hidden = forgotten) |
| **Modal / sheet** | Self-contained task (compose, filter, confirm) | Multi-step primary flows |
| **Segmented control / top tabs** | Switching views of the SAME content | Navigating to different sections |

Most apps = **bottom tabs + a stack inside each tab**. Reserve the drawer for
overflow, not primary nav.

---

## Platform conventions (diverge here)

| | iOS | Android |
|--|-----|---------|
| Back | Edge-swipe from left + nav-bar back button | System back gesture/button (must handle!) |
| Title | Large title that collapses on scroll | App bar title, often left-aligned |
| Tabs | Bottom tab bar | Bottom navigation bar (Material) |
| Forward transition | Push from right | Material shared-axis/fade |

**Android back button is mandatory** — handle it on every screen (dismiss modal,
pop stack, or exit). On iOS, never break the left-edge back swipe.

---

## React Navigation (RN) skeleton

```tsx
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Feed" component={Feed} />
      <HomeStack.Screen name="Detail" component={Detail} />
    </HomeStack.Navigator>
  );
}

<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeStackScreen} />
  <Tab.Screen name="Search" component={SearchStackScreen} />
  <Tab.Screen name="Profile" component={ProfileStackScreen} />
</Tab.Navigator>
```

Use `createNativeStackNavigator` (native screens) over the JS stack for native
transitions and perf.

---

## Deep linking — plan from day one

Every screen reachable by a URL. Drives notifications, shares, marketing links,
universal links.

```ts
const linking = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Home: { screens: { Detail: "item/:id" } },
      Profile: "profile/:userId",
    },
  },
};
```

- **iOS:** Universal Links (apple-app-site-association) + custom scheme fallback.
- **Android:** App Links (assetlinks.json) + intent filters.
- **Cold start:** handle the link when the app launches from dead, not just when
  already running.
- **Notification payloads** carry the route → tap lands on the right screen.

---

## Navigation UX rules

- Preserve scroll position and form state when navigating back.
- Don't trap users — always a clear way out (back, close, cancel).
- Confirm before discarding unsaved input on back/dismiss.
- Keep the back stack sane — avoid loops; reset to a known root after auth flows.
- Tab switches should restore each tab's own stack, not reset it.
