# Examples

Concrete walk-throughs of how to apply this skill.

---

## Example 1 — Open-ended request: "Build me a mobile app for tracking habits"

**Wrong (AI default):** Immediately scaffold React Native + Redux + a ScrollView
list and start writing screens.

**Right:** Stop and ask the blocking questions first.

```
Before I build, I need 3 decisions:
1. Platform — iOS, Android, or both?
2. Framework — React Native, Flutter, or native? (Any existing code/team skills?)
3. Offline — must habit logging work with no network?
```

Then fill the CHECKPOINT before any code:

```
🧠 CHECKPOINT:
Platform:   Both
Framework:  React Native + Expo
Files Read: mobile-design-thinking.md, touch-psychology.md, mobile-performance.md
3 Principles:
1. Habit list = FlashList, memoized rows
2. "Log habit" CTA in thumb zone (bottom)
3. Offline-first: write to local DB, sync when online
Anti-Patterns Avoided:
1. ScrollView for list → FlashList
2. Token in AsyncStorage → SecureStore
3. Network-required logging → local-first
```

---

## Example 2 — Fixing a janky list (React Native)

**Symptom:** Scroll stutters, memory climbs with a 2,000-item feed.

**Before:**
```tsx
<ScrollView>
  {items.map((item) => (
    <View key={item.title}>
      <Text>{item.title}</Text>
    </View>
  ))}
</ScrollView>
```

Three sins: ScrollView renders everything, `key` is non-unique title, inline JSX.

**After:**
```tsx
const Row = React.memo(({ item }: { item: Item }) => (
  <View style={styles.row}><Text>{item.title}</Text></View>
));

const renderItem = useCallback(
  ({ item }: { item: Item }) => <Row item={item} />,
  []
);

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(it) => it.id}
  getItemLayout={(_, i) => ({ length: ROW_H, offset: ROW_H * i, index: i })}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

Run `python scripts/mobile_audit.py .` to confirm no remaining `ScrollView`
+ `.map()` patterns or index keys.

---

## Example 3 — Platform divergence done right (cross-platform sheet)

A confirmation action should feel native on each OS.

```tsx
import { Platform, ActionSheetIOS, Alert } from "react-native";

function confirmDelete(onConfirm: () => void) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ["Cancel", "Delete"], destructiveButtonIndex: 1, cancelButtonIndex: 0 },
      (i) => i === 1 && onConfirm()
    );
  } else {
    Alert.alert("Delete item?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]);
  }
}
```

Business logic (`onConfirm`) is unified; presentation diverges per platform —
exactly what the Platform Decision Matrix prescribes.

---

## Example 4 — Secure token storage

**Wrong:**
```tsx
await AsyncStorage.setItem("authToken", token); // readable on rooted device
```

**Right:**
```tsx
import * as SecureStore from "expo-secure-store";
await SecureStore.setItemAsync("authToken", token); // Keychain / EncryptedSharedPreferences
```
