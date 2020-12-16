'use strict'

const blockOpener = /^```(js|javascript)$/mg
const blockCloser = /^```$/mg

// Extract all code blocks in the file
function extractCodeBlocks (text) {
  let currentBlock = ''
  const blocks = []
  let insideBlock = false
  const lines = text.split('\n')
  let startLine

  lines.forEach(function (line, index) {
    const originalLine = line
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
