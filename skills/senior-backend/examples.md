# Senior Backend — Examples

## Example 1: Thin handler, fat service (Express + TypeScript)

```ts
// schema.ts
import { z } from "zod";
export const CreateOrder = z.object({
  items: z.array(z.object({ sku: z.string(), qty: z.number().int().positive() })).min(1),
});

// controller.ts — parse + delegate only
router.post("/orders", async (req, res, next) => {
  try {
    const dto = CreateOrder.parse(req.body);           // validate at boundary
    const order = await orderService.create(req.user.id, dto);
    res.status(201).json(order);
  } catch (err) { next(err); }                          // central error handler
});

// service.ts — no HTTP knowledge, testable
export async function create(userId: string, dto: CreateOrderDto) {
  return db.tx(async (t) => {
    const order = await t.orders.insert({ userId, status: "pending" });
    await t.orderItems.bulkInsert(order.id, dto.items);
    return order;
  });
}
```

## Example 2: Central error handler with consistent shape

```ts
class AppError extends Error {
  constructor(public code: string, public status: number, msg: string) { super(msg); }
}

app.use((err, req, res, _next) => {
  const id = req.id;
  if (err instanceof z.ZodError)
    return res.status(422).json({ error: { code: "validation", details: err.issues } });
  if (err instanceof AppError)
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  logger.error({ id, err });                            // log internals, not to client
  res.status(500).json({ error: { code: "internal", message: "Unexpected error" } });
});
```

## Example 3: Fix N+1 with a join

```sql
-- Bad: 1 + N queries (fetch orders, then items per order in a loop)

-- Good: single query
SELECT o.id, o.status, i.sku, i.qty
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = $1
ORDER BY o.created_at DESC;
```

## Example 4: Cursor (keyset) pagination

```sql
-- Page 1
SELECT id, created_at FROM events
WHERE user_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page: pass the last row's (created_at, id) as the cursor
SELECT id, created_at FROM events
WHERE user_id = $1 AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```
Keyset stays fast at any depth; `OFFSET 100000` scans and discards 100k rows.

## Example 5: Resource-level authorization

```ts
// Route-level auth is not enough — verify ownership.
async function getOrder(req, res) {
  const order = await orderService.byId(req.params.id);
  if (!order) throw new AppError("not_found", 404, "Order not found");
  if (order.userId !== req.user.id && !req.user.roles.includes("admin"))
    throw new AppError("forbidden", 403, "Not your order");
  res.json(order);
}
```

## Example 6: Idempotent write

```ts
// Client sends Idempotency-Key header; safe to retry on timeout.
async function charge(req, res) {
  const key = req.header("Idempotency-Key");
  const existing = await idempo.get(key);
  if (existing) return res.status(existing.status).json(existing.body);

  const result = await payments.charge(req.body);
  await idempo.save(key, { status: 201, body: result });
  res.status(201).json(result);
}
```
