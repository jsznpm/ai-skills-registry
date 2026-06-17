# Streaming SSR — Examples

## Example 1: Stream slow content with Suspense

The shell flushes immediately; the slow data-dependent part streams in when ready.

```jsx
// App.jsx
import { Suspense } from "react";

function App() {
  return (
    <html>
      <body>
        <h1>Cat Facts</h1>            {/* shell — sent first */}
        <Suspense fallback={<p>Loading facts…</p>}>
          <CatFacts />                {/* streams in later */}
        </Suspense>
      </body>
    </html>
  );
}
```
`onShellReady` fires once `<h1>` + the fallback are ready. React streams the
real `<CatFacts />` markup plus an inline script to swap out the fallback once
the suspended data resolves.

## Example 2: Node server with renderToPipeableStream

```js
import { renderToPipeableStream } from "react-dom/server";
import App from "./App.jsx";

app.get("*", (req, res) => {
  let didError = false;
  const { pipe, abort } = renderToPipeableStream(<App />, {
    bootstrapScripts: ["/build/client.js"],
    onShellReady() {
      res.statusCode = didError ? 500 : 200;
      res.setHeader("Content-Type", "text/html");
      pipe(res);                       // start streaming the shell
    },
    onError(err) {
      didError = true;
      console.error(err);
    },
  });
  // Abort streaming if it takes too long, fall back to client render.
  setTimeout(abort, 10_000);
});
```

## Example 3: Edge / Web Streams runtime

```js
import { renderToReadableStream } from "react-dom/server";

export default async function handler(request) {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScripts: ["/build/client.js"],
    onError(err) { console.error(err); },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
}
```

## Example 4: Client hydration

```js
// client.js
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

hydrateRoot(document, <App />);
```
`hydrateRoot` attaches event handlers to the streamed HTML and supports
progressive hydration of Suspense boundaries as their content arrives.

## Pitfall: response buffering kills streaming

If a reverse proxy (nginx) or serverless platform buffers the full response,
the client gets everything at once — no TTFB win. For nginx, disable buffering:

```
proxy_buffering off;
```
