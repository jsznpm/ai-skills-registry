# Examples

## Missing await introduced by a change
```
src/api/user.ts:42: blocker: getUser() returns a Promise but result is used as
  an object. Add await: const u = await getUser(id).
```

## Off-by-one in new loop
```
src/list.ts:18: major: loop uses i <= items.length, reads past end. Use i < length.
```

## Clean diff
```
No issues in the changed hunks.
```
