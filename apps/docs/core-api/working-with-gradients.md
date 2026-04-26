# Parse a gradient

```ts
import { parse } from 'gradiente'

const gradient = parse(
  'linear-gradient(to right, red, blue)'
)
```


## Inspect the gradient

```ts
gradient.type
gradient.isRepeating
gradient.config
gradient.stops
```


### Example

```ts
gradient.type        // 'linear-gradient'
gradient.isRepeating // false
gradient.config      // direction, angle, etc.
gradient.stops       // array of stops
```


## Work with stops

Stops are stored as an array:

```ts
gradient.stops
```


### Add a stop

```ts
gradient.addStop({
  color: 'green',
  position: 0.5
})
```


### Remove a stop

```ts
// Stops removing by it's index
gradient.removeStop(0)
```


## Clone a gradient

```ts
const copy = gradient.clone()
```

Creates a safe copy.


## Compare gradients

```ts
gradient.equals(copy) // true
```

Useful for detecting changes.


## Convert back to string

```ts
gradient.toString()
```


### Example

```ts
parse('linear-gradient(red, blue)').toString()
// → normalized output
```


## Convert to JSON

```ts
gradient.toJSON()
```


### Example

```ts
{
  type: 'linear-gradient',
  isRepeating: false,
  config: {...},
  stops: [...]
}
```


## Typical workflow

```ts
const gradient = parse(input)

// inspect
gradient.stops

// modify
gradient.addStop({ color: 'green', position: 0.5 })

// serialize
const output = gradient.toString()
```


## Summary

```txt
parse → get gradient object
inspect → read properties
modify → add/remove stops
clone → safe copy
equals → compare gradients
toString → serialize to string
toJSON → serialize to data
```