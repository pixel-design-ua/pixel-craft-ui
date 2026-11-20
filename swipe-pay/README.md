# Swipe to Pay

Slide-to-confirm button: drag the handle to the end to pay; a short drag snaps back.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `SwipeToPay.jsx` into your project, then:

```jsx
import SwipeToPay from "./SwipeToPay";

<SwipeToPay amount="$24.90" onPay={() => console.log("paid")} />
```

`onPay` fires when the handle is dragged past 90% of the track. Call your payment API there.

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
