# standard-markdown

Test your Markdown files for Standard JavaScript Style™

## Installation

```sh
npm install standard-markdown --save
```

## Usage

This module works just like `standard`, but instead of linting javascript files, it lints GitHub-Flavored `js` and `javascript` code blocks inside markdown files.

Lint everything in the current directory:

```sh
standard-markdown
```

Or lint some other directory:

```sh
standard-markdown some/other/directory
```

All files with `.md` or `.markdown` extension are linted, and the following directories are ignored:

- `.git`
- `node_modules`
- `vendor`

## Tests

```sh
npm install
npm test
```

## Dependencies

- [async](https://github.com/caolan/async): Higher-order functions and common patterns for asynchronous code
- [globby](https://github.com/sindresorhus/globby): Extends `glob` with support for multiple patterns and exposes a Promise API
- [lodash.flatten](https://github.com/lodash/lodash): The lodash method `_.flatten` exported as a module.
- [lodash.range](https://github.com/lodash/lodash): The lodash method `_.range` exported as a module.
- [standard](https://github.com/feross/standard): JavaScript Standard Style

## Dev Dependencies

- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers


## License

MIT
