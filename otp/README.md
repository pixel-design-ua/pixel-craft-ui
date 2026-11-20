# OTP Verification

Animated 4-digit code input: auto-focus to the next box, Backspace goes back, digits only, loading and success states.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `OtpVerification.jsx` into your project, then:

```jsx
import OtpVerification from "./OtpVerification";

<OtpVerification length={4} onVerify={(code) => console.log(code)} />
```

`onVerify` is called with the entered code after the short "Verifying…" state. Replace the `setTimeout` in `OtpVerification.jsx` with your real API call.

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
