# standard-markdown [![Build Status](https://travis-ci.org/zeke/standard-markdown.svg?branch=master)](https://travis-ci.org/zeke/standard-markdown)

Test your Markdown files for Standard JavaScript Style™

## Installation

```sh
npm install standard-markdown --save
```

## Usage
### Linting

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

This module disables certain rules that were considered not appropriate for linting JS blocks in markdown. See [#2](https://github.com/zeke/standard-markdown/issues/2) for more information.

Currently we disable the following rules:

* [`no-undef`](http://eslint.org/docs/rules/no-undef)  
* [`no-unused-vars`](http://eslint.org/docs/rules/no-unused-vars)  
* [`no-lone-blocks`](http://eslint.org/docs/rules/no-lone-blocks)  
* [`no-labels`](http://eslint.org/docs/2.0.0/rules/no-labels)  

### Fixing

This module also provides the ability to automatically fix some common issues with JS snippets (extra semicolons, bad whitespacing, Etc.)

Fix everything where it is

```sh
standard-markdown some/directory --auto-fix
```

Fix everything and write it to a temporary directory "some/directory_dry_run"

```sh
standard-markdown some/directory --auto-fix --dry-run
```

Once the module has attempted to fix all your issues it will run the linter on the generated files so you can see how much it fixed.

## Tests

```sh
npm install
npm test
```

## Dependencies

- [async](https://github.com/caolan/async): Higher-order functions and common patterns for asynchronous code
- [commander](https://github.com/tj/commander.js): The complete solution for node.js command-line programs
- [globby](https://github.com/sindresorhus/globby): Extends `glob` with support for multiple patterns and exposes a Promise API
- [lodash.flatten](https://github.com/lodash/lodash): The lodash method `_.flatten` exported as a module.
- [lodash.range](https://github.com/lodash/lodash): The lodash method `_.range` exported as a module.
- [mkdirp](https://github.com/substack/node-mkdirp): Recursively mkdir, like `mkdir -p`, but in node.js
- [standard](https://github.com/feross/standard): JavaScript Standard Style
- [standard-format](https://github.com/maxogden/standard-format): Converts your code into Standard JavaScript Format

## Dev Dependencies

- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers


## License

MIT
