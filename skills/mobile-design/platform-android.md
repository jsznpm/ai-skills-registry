# Platform: Android

> Material Design 3 (Material You). Android spans a huge device range — design for
> variety and honor system navigation.

---

## Visual identity

- **Font:** Roboto (system); Material 3 type scale (display/headline/title/body/
  label). Sizes in `sp` so they scale with the user's font setting.
- **Icons:** Material Symbols (filled/outlined/rounded; adjustable weight & fill).
- **Material You / dynamic color:** on Android 12+, you can derive the palette
  from the user's wallpaper. Otherwise define a tonal color scheme.
- **Elevation & shadows:** Material uses elevation (shadows in light, lighter
  surfaces in dark) to express hierarchy.

---

## Touch & layout

- **Min touch target: 48 × 48 dp.**
- **Edge-to-edge + insets:** handle status bar, navigation bar, gesture areas
  (`WindowInsets`). Content draws under system bars with proper padding.
- **Bottom navigation bar** (≤5 destinations); **top app bar** with title and
  actions; **FAB** for the single primary action where appropriate.

---

## Navigation conventions (CRITICAL)

- **System back** (gesture or button) MUST be handled on every screen — dismiss
  modal → pop stack → exit app. Failing to handle it is the #1 Android sin.
- **Predictive back** (Android 14+): support the back-preview animation.
- Up button (top-left arrow) navigates within app hierarchy; distinct from system
  back. Wire both.

---

## Components & feel

| Need | Material choice |
|------|-----------------|
| Confirm/alert | Material `AlertDialog` |
| Contextual actions | Bottom sheet (modal or standard) |
| Brief message | Snackbar (bottom, optional action) — NOT iOS-style toast for actions |
| Date/time | Material date/time pickers |
| Pull to refresh | `SwipeRefreshLayout` / pull-refresh indicator |
| Progress | Linear or circular Material progress |
| Switch / selection | Material switch, checkbox, radio, chips |
| Primary action | FAB (Floating Action Button) |

Use **Snackbar** (not a dialog) for transient feedback; reserve dialogs for
decisions that block.

---

## Jetpack Compose patterns (if native)

```kotlin
@Composable
fun ItemsScreen(vm: ItemsViewModel = viewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    Scaffold(
        topBar = { TopAppBar(title = { Text("Items") }) },
        floatingActionButton = { FloatingActionButton(onClick = vm::add) { Icon(Icons.Default.Add, null) } }
    ) { padding ->
        LazyColumn(contentPadding = padding) {           // builder-style, recycles
            items(state.items, key = { it.id }) { Row(it) }
        }
    }
}
```

- State hoisting + `ViewModel` + `StateFlow`; collect with lifecycle awareness.
- `remember`/`derivedStateOf` to avoid recompositions; stable keys in `items`.
- `@Stable`/`@Immutable` data to help the compiler skip recomposition.

---

## Device variety & platform musts

- Test across screen sizes/densities (ldpi→xxxhdpi), notches, foldables, tablets.
- Runtime permissions (Android 6+): request in context; handle "denied" and
  "don't ask again".
- Notification channels (Android 8+) — group by category so users can tune.
- Support dark theme, large fonts, TalkBack.
- Respect Doze/background limits — don't assume background execution; use
  WorkManager for deferrable work, FCM for push.
