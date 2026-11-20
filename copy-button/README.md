# Copy Button

Copy-to-clipboard button with animated copied and error states that reset on their own.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `CopyButton.jsx` into your project, then:

```jsx
import CopyButton from "./CopyButton";

<CopyButton text="npm i framer-motion" onCopy={(ok) => console.log(ok)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
