'use strict'

var fs = require('fs')
var standardFormat = require('standard-format')

var extractCodeBlocks = require('./codeBlockUtils').extractCodeBlocks

var formatter = module.exports = {}

formatter.formatText = function (text, errorHandler) {
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

formatter.formatFiles = function (files, verbose) {
  return files.map(function (file, index) {
    // Inform the user of progress
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write('Formatting file ' + (index + 1) + ' of ' + files.length)

    var originalText = fs.readFileSync(file, 'utf8')
    return {
      originalText: originalText.replace(/(\r\n?|\n)/g, '\n'),
      cleanText: formatter.formatText(originalText, function (errorBlock) {
        if (!verbose) return
        console.error('Failed to parse a code block:')
        console.error(file)
        console.error(errorBlock + '\n')
      }),
      file: file
    }
  })
}
