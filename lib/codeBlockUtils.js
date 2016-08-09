'use strict'

var range = require('lodash.range')

var blockOpener = /^```(js|javascript)$/mg
var blockCloser = /^```$/mg

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
        currentBlock = ''
      }
      line = '// -' + line
    }
    return line
  }).join('\n').concat('\n') // standard requires a newline at end of file
}

module.exports = {
  extractCodeBlocks: extractCodeBlocks
}
