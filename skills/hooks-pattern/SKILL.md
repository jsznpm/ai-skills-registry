---
name: hooks-pattern
description: Teaches React Hooks for reusing stateful logic across components. Use when extracting shared behavior like form handling, subscriptions, or side effects into reusable custom hooks.
---

# Hooks Pattern

## Table of Contents

- [When to Use](#when-to-use)
- [Instructions](#instructions)
- [Details](#details)
- [Source](#source)

React 16.8 introduced a new feature called [**Hooks**](https://react.dev/reference/react/hooks). Hooks make it possible to use React state and lifecycle methods, without having to use an ES2015 class component.

Although Hooks are not necessarily a design pattern, Hooks play a very important role in your application design. Many traditional design patterns can be replaced by Hooks.

## When to Use

- Use this when you need to add state or lifecycle behavior to functional components
- This is helpful for extracting and reusing stateful logic across multiple components
- Use this instead of class components for cleaner, more composable code

## Instructions

- Use `useState` for local state and `useEffect` for side effects in functional components
- Create custom hooks (prefixed with `use`) to encapsulate and share reusable logic
- Follow the Rules of Hooks: only call hooks at the top level and only in React functions
- Avoid unnecessary `useEffect` — compute derived state directly in the component body
- Let the React Compiler handle memoization instead of manual `useMemo`/`useCallback` where possible

## Details

### Class components

Before Hooks were introduced in React, we had to use class components in order to add state and lifecycle methods to components. A typical class component in React can look something like:

```js
class MyComponent extends React.Component {
  /* Adding state and binding custom methods */
  constructor() {
    super()
    this.state = { ... }

    this.customMethodOne = this.customMethodOne.bind(this)
    this.customMethodTwo = this.customMethodTwo.bind(this)
  }

  /* Lifecycle Methods */
  componentDidMount() { ...}
  componentWillUnmount() { ... }

  /* Custom methods */
  customMethodOne() { ... }
  customMethodTwo() { ... }

  render() { return { ... }}
}
```

A class component can contain a state in its constructor, lifecycle methods such as `componentDidMount` and `componentWillUnmount` to perform side effects based on a component's lifecycle, and custom methods to add extra logic to a class.

Although we can still use class components after the introduction of React Hooks, using class components can have some downsides! Let's look at some of the most common issues when using class components.

#### Understanding ES2015 classes

Since class components were the only component that could handle state and lifecycle methods before React Hooks, we often ended up having to refactor functional components into a class components, in order to add the extra functionality.

In this example, we have a simple `div` that functions as a button.

```js
function Button() {
  return <div className="btn">disabled</div>;
}
```

Instead of always displaying `disabled`, we want to change it to `enabled` when the user clicks on the button, and add some extra CSS styling to the button when that happens.

In order to do that, we need to add state to the component in order to know whether the status is `enabled` or `disabled`. This means that we'd have to refactor the functional component entirely, and make it a class component that keeps track of the button's state.

```js
export default class Button extends React.Component {
  constructor() {
    super();
    this.state = { enabled: false };
  }

  render() {
    const { enabled } = this.state;
    const btnText = enabled ? "enabled" : "disabled";

    return (
      <div
        className={`btn enabled-${enabled}`}
        onClick={() => this.setState({ enabled: !enabled })}
      >
        {btnText}
      </div>
    );
  }
}
```

In this example, the component is very small and refactoring wasn't such a great deal. However, your real-life components probably contain many more lines of code, which makes refactoring the component a lot more difficult.

Besides having to make sure you don't accidentally change any behavior while refactoring the component, you also need to **understand how ES2015 classes work**. Why do we have to `bind` the custom methods? What does the `constructor` do? Where does the `this` keyword come from? It can be difficult to know how to refactor a component properly without accidentally changing the data flow.

#### Restructuring

The common way to share code among several components is by using the Higher Order Component or Render Props pattern. Although both patterns are valid and a good practice, adding those patterns at a later point in time requires you to restructure your application.

Besides having to restructure your app, which is trickier the bigger your components are, having many wrapping components in order to share code among deeper nested components can lead to something that's best referred to as a _**wrapper hell**_. It's not uncommon to open your dev tools and see a structure similar to:

```js
<WrapperOne>
  <WrapperTwo>
    <WrapperThree>
      <WrapperFour>
        <WrapperFive>
          <Component>
            <h1>Finally in the component!</h1>
          </Component>
        </WrapperFive>
      </WrapperFour>
    </WrapperThree>
  </WrapperTwo>
</WrapperOne>
```

The _wrapper hell_ can make it difficult to understand how data is flowing through your application, which can make it harder to figure out why unexpected behavior is happening.

#### Complexity

As we add more logic to class components, the size of the component increases fast. Logic within that component can get **tangled and unstructured**, which can make it difficult for developers to understand where certain logic is used in the class component. This can make debugging and optimizing performance more difficult.

Lifecycle methods also require quite a lot of duplication in the code. Certain parts of `componentDidMount` and `componentWillUnmount` are often specific to unrelated concerns (e.g. a counter vs. a window-width listener) yet live side by side, making the component harder to reason about as it grows.

### Hooks

React introduced **React Hooks** to solve the common issues developers ran into with class components. React Hooks are functions that let you manage a component's state and lifecycle. React Hooks make it possible to:

- add state to a functional component
- manage a component's lifecycle without lifecycle methods such as `componentDidMount` and `componentWillUnmount`
- reuse the same stateful logic among multiple components throughout the app

#### State Hook

React provides a hook that manages state within a functional component, called `useState`.

```js
class Input extends React.Component {
  constructor() {
    super();
    this.state = { input: "" };
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    return <input onChange={this.handleInput} value={this.state.input} />;
  }
}
```

The `useState` method expects an argument: the initial value of the state. We can destructure two values from it:

1. The **current value** of the state.
2. The **method with which we can update** the state.

```js
const [value, setValue] = React.useState(initialValue);
```

The first value can be compared to a class component's `this.state.[value]`. The second value can be compared to a class component's `this.setState` method.

```js
function Input() {
  const [input, setInput] = React.useState("");

  return <input onChange={(e) => setInput(e.target.value)} value={input} />;
}
```

#### Effect Hook

With the `useEffect` hook, we can "hook into" a component's lifecycle. It effectively combines the `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` lifecycle methods.

```js
componentDidMount() { ... }
useEffect(() => { ... }, [])

componentWillUnmount() { ... }
useEffect(() => { return () => { ... } }, [])

componentDidUpdate() { ... }
useEffect(() => { ... })
```

Whenever the user is typing in an input field, we can log that value to the console by listening to `input` in the dependency array:

```js
useEffect(() => {
  console.log(`The user typed ${input}`);
}, [input]);
```

### Custom Hooks

Besides the built-in hooks that React provides (`useState`, `useEffect`, `useReducer`, `useRef`, `useContext`, `useMemo`, `useImperativeHandle`, `useLayoutEffect`, `useDebugValue`, `useCallback`), we can create our own custom hooks. Hook names must start with `use` so React can enforce the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).

```js
function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = React.useState(false);

  function handleDown({ key }) {
    if (key === targetKey) setKeyPressed(true);
  }

  function handleUp({ key }) {
    if (key === targetKey) setKeyPressed(false);
  }

  React.useEffect(() => {
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return keyPressed;
}
```

Instead of keeping key-press logic local to one component, `useKeyPress` can be reused throughout multiple components without rewriting the same logic. The community also builds and shares hooks — see [React Use](https://github.com/streamich/react-use) and [useHooks](https://usehooks.com/).

### Additional Hooks guidance

#### `useState`

Enables updating and manipulating state inside function components without converting to a class component.

#### `useEffect`

Runs code during major lifecycle events. The main body of a function component should not perform mutations, subscriptions, timers, logging, or other side effects directly — `useEffect` isolates those side effects so the UI runs smoothly.

#### `useContext`

Accepts a context object (returned from `React.createContext`) and returns the current context value, letting you share data throughout the app without prop drilling. The argument must be the context object itself, and any component calling `useContext` re-renders whenever the context value changes.

#### `useReducer`

An alternative to `useState`, preferable when you have complex state logic involving multiple sub-values or when the next state depends on the previous one. Takes a `reducer` function and initial state, returns `[state, dispatch]`. Also helps optimize components that trigger deep updates.

### Pros

- **Fewer lines of code** — group code by concern instead of by lifecycle method, avoiding duplication across `componentDidMount`/`componentDidUpdate`/`componentWillUnmount`.
- **Simplifies complex components** — no `this` binding, no constructor boilerplate, better minification and hot reloading.
- **Reusing stateful logic** — share state logic via plain functions instead of deep class inheritance chains.
- **Sharing non-visual logic** — extract stateful logic to a function instead of reaching for HOCs or Render Props just to share code.

Trade-offs to keep in mind:

- Hooks have rules that a linter plugin (`eslint-plugin-react-hooks`) should enforce — without it, violations are easy to miss.
- `useEffect` takes real practice to use correctly (dependency arrays, cleanup functions).
- `useMemo`/`useCallback` are easy to misuse — measure before reaching for them, and prefer the React Compiler when available.

### React Hooks vs Classes

| React Hooks | Classes |
| --- | --- |
| Avoids multiple wrapping hierarchies, keeping component trees clearer | HOCs and Render Props often require restructuring the app into multiple hierarchies visible in DevTools |
| Uniform mental model across components | `this` binding and class context often confuse both humans and tooling |

## Source

- [patterns.dev/react/hooks-pattern](https://patterns.dev/react/hooks-pattern)
