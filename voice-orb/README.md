# Voice Orb

AI voice-assistant orb woven from thousands of flowing fibers that breathe, flare with your voice, wind into a vortex while thinking and bloom as it speaks.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `VoiceOrb.jsx` into your project, then:

```jsx
import VoiceOrb from "./VoiceOrb";

<VoiceOrb respond={(heard) => ask(heard)} onChange={(state) => console.log(state)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
