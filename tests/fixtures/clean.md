# The Clean Readme

This is a markdown file with some javascript code blocks in it.

```js
console.log('all good here!')
```

There are no linting errors in this file.

```javascript
let wibble = 2
console.log(wibble)
```

It should allow use of undefined variables

```javascript
win.close()
```

It should allow creation of unused variables

```js
// `BrowserWindow` is declared but not used
const {BrowserWindow} = require('electron')
```

It should allow orphan objects:

```js
{some: 'object'}
```

and this wrapping kind too:

```js
{
  some: 'object',
  with: 'different whitespace and tabbing'
}
```

and arrays:

```js
[1,2,3]
```

and wrapped arrays:

```js
[
  4,
  5,
  6,
]
```
