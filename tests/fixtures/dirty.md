# The Dirty Readme

This is a markdown file with some javascript code blocks in it.

```js
var foo = 1;
```

Each block is parsed separately, to avoid linting errors about variable
assignment. Notice that `var foo` occurs twice in this markdown file,
but only once in each individual snippet.

The following code block has a few issues:

- semicolons
- type-insensitive equality comparison
- double-quoted string

```javascript
var foo = 2;
if (foo == 1) console.log("foo is one");
```

This non-js code block should be ignored by the linter:

```sh
echo i am a shell command
```
