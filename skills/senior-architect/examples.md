# Examples

## 1. Design a system

> "Design the backend for a food-delivery app: 50k daily orders, live driver
> tracking, must survive a payment-provider outage."

A good response names constraints (write-heavy on location pings, strong
consistency on payments, eventual on tracking), gives a Mermaid component
diagram, and records ADRs: Postgres for orders/payments (ACID), a separate
high-write store or stream for location pings, async queue for notifications,
idempotency keys + outbox pattern so a payment-provider outage degrades to
"pending" rather than losing orders.

## 2. Choose between options

> "GraphQL or REST for our public API?"

Frames it as a decision: client read patterns (many resources per screen →
GraphQL), caching needs (resource-shaped + CDN → REST), team familiarity, and
the cost of schema governance. Ends with a pick and the one constraint that
decided it, plus a revisit trigger.

## 3. Review an existing architecture

> "Here's our setup: Next.js → Express → Mongo, all sync. Review it."

Flags risks: sync chains without timeout budgets, Mongo chosen without a scale
driver, no observability, no API versioning. Proposes concrete changes ranked by
risk, not a rewrite.

## 4. Pick a mobile stack

> "Cross-platform app, small team, needs Bluetooth and offline sync."

Weighs Flutter/React Native (shared UI, faster shipping) against native
(Bluetooth + background sync are platform-API heavy). Recommends per the
constraint that dominates — here, hardware access — and names where the choice
would flip.
