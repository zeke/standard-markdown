'use strict'

var blockOpener = /^```(js|javascript)$/mg
var blockCloser = /^```$/mg

// Extract all code blocks in the file
function extractCodeBlocks (text) {
  var currentBlock = ''
  var blocks = []
  var insideBlock = false
  var lines = text.split('\n')
  var startLine

  lines.forEach(function (line, index) {
    var originalLine = line
    // standard doesn't like trailing whitespace
    line = line.replace(/\s*$/, '')

    if (blockOpener.test(line)) {
      insideBlock = true
      startLine = index
    }
    if (blockCloser.test(line)) insideBlock = false
    if (insideBlock) {
      currentBlock += originalLine + '\n'
    }
    if (!insideBlock) {
      if (currentBlock) {
        currentBlock = currentBlock.replace(/^```.*(\r\n?|\n)/g, '')
        blocks.push({
          code: currentBlock,
          line: startLine
        })
        currentBlock = ''
      }
    }
  })

  return blocks
}

module.exports = {
  extractCodeBlocks: extractCodeBlocks
}
