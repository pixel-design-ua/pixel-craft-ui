# Hover Bars

Bar chart with a hover and keyboard tooltip, animated bars and a click callback.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `HoverBars.jsx` into your project, then:

```jsx
import HoverBars from "./HoverBars";

<HoverBars data={[["Jan", 180], ["Feb", 240], ["Mar", 420]]} unit="k" onSelect={([label, value]) => console.log(label, value)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
