# Examples

## Lifting state vs deriving

Bad — duplicated state:
```jsx
const [items, setItems] = useState([]);
const [count, setCount] = useState(0); // redundant
```

Good — derive:
```jsx
const [items, setItems] = useState([]);
const count = items.length;
```

## Stable list keys
```jsx
{users.map((u) => <Row key={u.id} user={u} />)}
```
