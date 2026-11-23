# Vinyl Deck

Now-playing widget with a spinning record, a tonearm that tracks progress, a waveform seek bar, loading, error and like states.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `VinylDeck.jsx` into your project, then:

```jsx
import VinylDeck from "./VinylDeck";

<VinylDeck track={{ title: "Golden Hour", artist: "Lumen Coast", length: 228 }} onPlay={(on) => fetchStream()} onSeek={(sec) => console.log(sec)} onLike={(v) => console.log(v)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
