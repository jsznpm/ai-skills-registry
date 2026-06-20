# Platform: iOS

> Apple Human Interface Guidelines (HIG). iOS users have deep muscle memory —
> honor the conventions or the app feels "wrong" even when it works.

---

## Visual identity

- **Font:** SF Pro (text) / SF Compact (watch), via system text styles. Large
  titles that collapse to inline on scroll are the iOS signature.
- **Icons:** SF Symbols — scale with text, support weights and Dynamic Type,
  match the platform. Prefer them over custom icon sets.
- **Spacing:** generous whitespace; standard 16pt margins; grouped content in
  rounded "inset" cards (iOS 13+ grouped table style).
- **Corners:** continuous (squircle) corner radii feel iOS-native.

---

## Touch & layout

- **Min touch target: 44 × 44 pt.**
- **Safe areas:** respect the notch/Dynamic Island and home indicator — use
  `SafeAreaView` (RN) / `SafeArea` insets. Never put controls under the indicator.
- **Tab bar** at bottom (≤5 items); **navigation bar** at top with back on the left.

---

## Navigation conventions

- **Back:** left-edge swipe + a back button (with previous screen's title) in the
  nav bar. NEVER break the edge-swipe-back gesture.
- **Modals:** sheets slide up from the bottom; swipe-down to dismiss; "Cancel"
  left, "Done"/confirm right in the modal nav bar.
- **Action sheets** slide from the bottom for contextual choices; destructive
  option in red, "Cancel" separated at the bottom.

---

## Components & feel

| Need | iOS-native choice |
|------|-------------------|
| Confirm/alert | `UIAlertController` alert (centered) |
| Contextual actions | Action sheet (bottom) |
| Pick from set | Wheel picker / menu |
| Date/time | Native date picker |
| Pull to refresh | `UIRefreshControl` |
| Progress (indeterminate) | Activity spinner |
| Switch | iOS toggle (green) |
| Swipe actions on rows | Leading/trailing swipe (e.g. delete in red trailing) |

---

## Haptics (Taptic Engine)

- Selection feedback for pickers/segmented controls.
- Notification feedback (success/warning/error) for outcomes.
- Impact feedback for significant UI moments. Don't overuse.

---

## SwiftUI patterns (if native)

```swift
struct ContentView: View {
    @State private var query = ""
    var body: some View {
        NavigationStack {
            List(items) { item in
                NavigationLink(value: item) { Row(item: item) }
            }
            .navigationTitle("Items")        // large title, auto-collapses
            .searchable(text: $query)        // native search bar
            .refreshable { await reload() }   // pull to refresh
        }
    }
}
```

- Use `@State`/`@Observable`/`@Binding` for local; `@Environment` for shared.
- Prefer system materials (`.regularMaterial`) for blur/translucency.

---

## App Store / platform musts

- Request permissions in context, with a clear purpose string (Info.plist usage
  descriptions are mandatory or the app is rejected).
- Support Dynamic Type, Dark Mode, VoiceOver.
- Sign in with Apple if you offer other social logins (App Store rule).
- Respect App Tracking Transparency before tracking.
