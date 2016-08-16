'use strict'

var standard = require('standard')
var fs = require('fs')
var range = require('lodash.range')
var flatten = require('lodash.flatten')
var async = require('async')
var blockOpener = /^```(js|javascript)$/mg
var blockCloser = /^```$/mg
var disabledRules = ['no-undef', 'no-unused-vars', 'no-lone-blocks', 'no-labels']
var standardMarkdown = module.exports = {}

standardMarkdown.lintText = function (text, done) {
  var blocks = extractCodeBlocks(text)

  async.map(blocks, function (block, callback) {
    block = wrapOrphanObjectInParens(block)
    var ignoredBlock = '/* eslint-disable ' + disabledRules.join(', ') + ' */\n' + block
    return standard.lintText(ignoredBlock, callback)
  }, function (err, results) {
    if (err) return done(err)
    results = results.map(function (r) {
      return r.results.map(function (res) {
        return res.messages.map(function (message) {
          // We added an extra line to the top of the "file" so we need to remove one here
          message.line -= 1
          return message
        })
      })
    })
    results = flatten(flatten(results))
    return done(null, results)
  })
}

standardMarkdown.lintFiles = function (files, done) {
  async.map(files, function (file, callback) {
    standardMarkdown.lintText(fs.readFileSync(file, 'utf8'), function (err, errors) {
      if (err) return callback(err)
      return callback(null, { file: file, errors: errors })
    })
  }, function (err, results) {
    if (err) return done(err)
    return done(null, results)
  })
}

function extractCodeBlocks (text) {
  var lines = text.split('\n')
  var matches = text.match(blockOpener) || []
  return range(matches.length).map(function (index) {
    return extractCodeBlock(lines, index)
  })
}

// Seek out the nth block of javascript code in the file
function extractCodeBlock (lines, targetIndex) {
  var currentIndex = 0
  var insideBlock = false
  return lines.map(function (line) {
    // standard doesn't like trailing whitespace
    line = line.replace(/\s*$/, '')

    if (line.match(blockOpener)) {
      if (currentIndex === targetIndex) {
        insideBlock = true
        line = '// -' + line
      }
      currentIndex++
    }
    if (line.match(blockCloser)) insideBlock = false
    if (!insideBlock) line = '// -' + line
    return line
  }).join('\n').concat('\n') // standard requires a newline at end of file
}

/*
If given code block is an orphan object like this:

```js
{an: 'object'}
```

then turn it into this:

```js
({an: 'object'})
```
*/
function wrapOrphanObjectInParens (block) {
  return block.replace(
    /\/\/ -```(js|javascript)\n([{|\[][\s\S]+[}|\]])\n\/\/ -```/mg,
    '// -```js\n($1)\n// -```'
  )
}
