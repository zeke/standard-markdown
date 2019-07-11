# The Clean Readme

This is a markdown file with some javascript code blocks in it.

```js
console.log('all good here!')
```

There are no linting errors in this file.

```javascript
const wibble = 2
console.log(wibble)
```

It should allow use of undefined variables

```javascript
win.close()
```

It should allow creation of unused variables

```js
// `BrowserWindow` is declared but not used
const { BrowserWindow } = require('electron')
```

It should allow orphan objects:

```js
{ some: 'object' }
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
[1, 2, 3]
```

and wrapped arrays:

```js
[
  4,
  5,
  6
]
```

Electron docs have a bunch of non-node-style callbacks that don't have `err` as the first arg:

```javascript
const { app } = require('electron')

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url === 'https://github.com') {
    callback(true)
  } else {
    callback(false)
  }
})
```
