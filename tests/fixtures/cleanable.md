# The Cleanable Readme

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
console.log("foo is two");
```

This non-js code block should be ignored by the cleaner and the linter:

```sh
echo i am a shell command
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
