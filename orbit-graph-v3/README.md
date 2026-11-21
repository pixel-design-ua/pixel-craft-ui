# Graph Search

Dark glass knowledge graph: search filters notes live, a click pulls the note to the center with its links on a ring.

## Install

```bash
npm i react react-dom framer-motion
```

## Use

Copy `GraphSearch.jsx` into your project, then:

```jsx
import GraphSearch from "./GraphSearch";

<GraphSearch nodes={nodes} edges={edges} onChange={(id) => console.log(id)} />
```

Styles are inline, so it works without any CSS setup. Change the `s` object at the bottom of the file to restyle it.
