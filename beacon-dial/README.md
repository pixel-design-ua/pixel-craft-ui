# Beacon Dial

Lighthouse lamp dial: turn it to aim a beam through a stippled storm, mark hidden rocks and keep a small boat lit until it reaches harbour.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `BeaconDial.jsx` into your project, then:

```jsx
import BeaconDial from "./BeaconDial";

<BeaconDial onResult={(r) => console.log(r)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
