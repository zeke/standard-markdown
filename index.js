'use strict'

var standard = require('standard')
var standardFormat = require('standard-format')
var fs = require('fs')
var range = require('lodash.range')
var flatten = require('lodash.flatten')
var async = require('async')
var blockOpener = /^```(js|javascript)$/mg
var blockCloser = /^```$/mg

var standardMarkdown = module.exports = {}

var disabledRules = ['no-undef', 'no-unused-vars', 'no-lone-blocks', 'no-labels']

standardMarkdown.formatText = function (text, errorHandler) {
  var originalText = text
  var hashes = {}
  extractCodeBlocks(text, function (block) {
    var uniqKey = JSON.stringify(block)
    // extractCodeBlocks returns duplicates so only handle unique ones
    if (hashes[uniqKey]) return
    hashes[uniqKey] = true
    try {
      originalText = originalText.replace(block, standardFormat.transform(block))
    } catch (err) {
      if (errorHandler) errorHandler(block, err)
    }
  })
  return originalText.trim().replace(/(\r\n?|\n)/g, '\n') + '\n'
}

standardMarkdown.formatFiles = function (files) {
  return files.map(function (file, index) {
    // Inform the user of progress
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write('Processing file ' + (index + 1) + ' of ' + files.length)

    var originalText = fs.readFileSync(file, 'utf8')
    return {
      originalText: originalText.replace(/(\r\n?|\n)/g, '\n'),
      cleanText: standardMarkdown.formatText(originalText, function (errorBlock) {
        console.error('Failed to parse a code block:')
        console.error(file)
        console.error(errorBlock + '\n')
      }),
      file: file
    }
  })
}

standardMarkdown.lintText = function (text, done) {
  var blocks = extractCodeBlocks(text)
  async.map(blocks, function (block, callback) {
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

function extractCodeBlocks (text, codeBlockFound) {
  var lines = text.split('\n')
  var matches = text.match(blockOpener) || []
  return range(matches.length).map(function (index) {
    return extractCodeBlock(lines, index, codeBlockFound)
  })
}

// Seek out the nth block of javascript code in the file
function extractCodeBlock (lines, targetIndex, codeBlockFound) {
  var currentIndex = 0
  var insideBlock = false
  var currentBlock = ''

  return lines.map(function (line) {
    var originalLine = line
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
    if (insideBlock) {
      currentBlock += originalLine + '\n'
    }
    if (!insideBlock) {
      if (currentBlock && codeBlockFound) {
        currentBlock = currentBlock.replace(/^```.*(\r\n?|\n)/g, '')
        codeBlockFound(currentBlock)
      }
      line = '// -' + line
    }
    return line
  }).join('\n').concat('\n') // standard requires a newline at end of file
}
