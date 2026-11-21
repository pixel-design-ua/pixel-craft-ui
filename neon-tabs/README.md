# Neon Tabs

Glowing tab bar with a gliding indicator, animated panels and full keyboard support.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `NeonTabs.jsx` into your project, then:

```jsx
import NeonTabs from "./NeonTabs";

<NeonTabs tabs={[{ id: "overview", label: "Overview", content: "Hello" }]} onChange={(id) => console.log(id)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
