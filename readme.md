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

If you want to specify which files to lint / which files to ignore you can use glob patterns

```sh
# This will lint everything in some/directory except everything in some/directory/api
standard-markdown some/directory **/*.md !api/**/*.md

# You also don't need to specify CWD to use globs
# This will only lint markdown file in the current directory
standard-markdown *.md
```

### Fixing

This module also provides the ability to automatically fix common syntax issues like extra semicolons, bad whitespacing, etc.
This functionality is provided by [standard](https://github.com/feross/standard#is-there-an-automatic-formatter).

```sh
standard-markdown some/directory --fix
```

Once the module has attempted to fix all your issues it will run the linter on the generated files so you can see how much it fixed.

## Rules

This module disables certain rules that were considered inappropriate for linting JS blocks:

* [`no-labels`](http://eslint.org/docs/rules/no-labels)
* [`no-lone-blocks`](http://eslint.org/docs/rules/no-lone-blocks)
* [`no-undef`](http://eslint.org/docs/rules/no-undef)
* [`no-unused-expressions`](http://eslint.org/docs/rules/no-unused-expressions)
* [`no-unused-vars`](http://eslint.org/docs/rules/no-unused-vars)
* [`standard/no-callback-literal`](https://github.com/xjamundx/eslint-plugin-standard#rules-explanations)

See
[#2](https://github.com/zeke/standard-markdown/issues/2),
[#18](https://github.com/zeke/standard-markdown/issues/18), and
[#19](https://github.com/zeke/standard-markdown/issues/19)
for reasons.

For more examples of what is and isn't allowed, see the
[clean](/tests/fixtures/clean.md) and
[dirty](/tests/fixtures/dirty.md) test fixtures.

## Tests

```sh
npm install
npm test
```

## Dependencies

- [commander](https://github.com/tj/commander.js): The complete solution for node.js command-line programs
- [globby](https://github.com/sindresorhus/globby): Extends `glob` with support for multiple patterns and exposes a Promise API
- [standard](https://github.com/feross/standard): JavaScript Standard Style

## Dev Dependencies

- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers


## License

MIT
