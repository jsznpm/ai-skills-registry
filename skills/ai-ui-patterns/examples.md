# AI UI Patterns — Examples

## Example 1: Minimal streaming chat (Next.js App Router + useChat)

**Server route** keeps the key server-side and streams:

```typescript
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages: convertToCoreMessages(messages),
  });
  return result.toDataStreamResponse();
}
```

**Client** binds the hook to the UI:

```tsx
"use client";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="inline-block px-3 py-2 rounded-lg bg-gray-100">{m.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input value={input} onChange={handleInputChange} disabled={isLoading}
          className="flex-1 border rounded px-3 py-2" placeholder="Ask…" />
        <button disabled={isLoading} className="bg-blue-600 text-white px-4 rounded">Send</button>
      </form>
    </div>
  );
}
```

## Example 2: Auto-scroll to newest message

```tsx
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages.length]);
// …render <div ref={bottomRef} /> after the message list
```

## Example 3: Debounced AI autocomplete (not chat)

```tsx
const [draft, setDraft] = useState("");
const [suggestion, setSuggestion] = useState("");

useEffect(() => {
  if (!draft) return;
  const id = setTimeout(async () => {
    const res = await fetch("/api/suggest", {
      method: "POST",
      body: JSON.stringify({ text: draft }),
    });
    setSuggestion((await res.json()).suggestion);
  }, 500);                       // wait for typing to pause
  return () => clearTimeout(id); // cancel stale calls
}, [draft]);
```

## Example 4: Inline error + retry

```tsx
const { messages, reload, error } = useChat();
// …
{error && (
  <div className="text-red-600 text-sm">
    Something went wrong. <button onClick={() => reload()} className="underline">Try again</button>
  </div>
)}
```

## Example 5: Manual streaming without the SDK

```js
const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
const reader = res.body.getReader();
const decoder = new TextDecoder();
let partial = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  partial += decoder.decode(value, { stream: true });
  setAssistantMessage(partial);   // re-render the growing reply
}
```

## Provider note

The patterns are provider-agnostic. To use Anthropic instead of OpenAI with the
Vercel AI SDK, swap the model:

```typescript
import { anthropic } from "@ai-sdk/anthropic";
const result = await streamText({ model: anthropic("claude-sonnet-4-6"), messages });
```
Everything else (the `useChat` client, streaming, error handling) stays the same.
