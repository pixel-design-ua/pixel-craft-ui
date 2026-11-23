# Object Scan

Image scanner that dithers a picture into dots under a sweeping scan line, then pops tracked detection boxes you can hover, focus and select.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `ObjectScan.jsx` into your project, then:

```jsx
import ObjectScan from "./ObjectScan";

<ObjectScan src="/photo.jpg" detect={(img) => model.detect(img)} onSelect={([label, score]) => console.log(label, score)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
