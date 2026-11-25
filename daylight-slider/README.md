# Daylight Slider

Vertical time-of-day slider that re-lights a dithered seascape from noon through golden and blue hour to night, with drag, keys and sun/moon jumps.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `DaylightSlider.jsx` into your project, then:

```jsx
import DaylightSlider from "./DaylightSlider";

<DaylightSlider defaultValue={780} onChange={(min) => setTheme(min >= 1260 ? "night" : "day")} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
