# Examples

## Server Component fetching data, Client child for interaction
```tsx
// app/products/page.tsx  (Server Component — no "use client")
import { AddToCart } from "./add-to-cart";

type Product = { id: string; name: string; price: number };

async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 }, // cache 60s, no client refetch
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((p) => (
        <li key={p.id} className="rounded-lg border p-4">
          <h2 className="font-medium">{p.name}</h2>
          <p className="text-sm text-gray-500">${p.price}</p>
          <AddToCart productId={p.id} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/products/add-to-cart.tsx  (Client — interactivity only)
"use client";
import { useState } from "react";

export function AddToCart({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => setAdded(true)}
      aria-pressed={added}
      className="mt-2 rounded bg-black px-3 py-1 text-sm text-white"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
```

## Code-split a heavy client-only widget
```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./chart"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded bg-gray-100" />,
});
```

## Derive state instead of duplicating it
```tsx
// Bad: fullName can drift out of sync
const [fullName, setFullName] = useState("");
// Good: derive on render
const fullName = `${first} ${last}`.trim();
```
