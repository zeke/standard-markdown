const eslint = require('eslint')
const standard = require('standard-engine').linter({
  eslint:eslint,
  eslintConfig: {}
})
const range = require('lodash.range')
const async = require('async')
const blockOpener = /^```(js|javascript)$/mg
const blockCloser = /^```$/mg

module.exports = function (text, done) {
  const blocks = extractCodeBlocks(text)
  console.error(blocks[0])
  console.error("\n\n\n")
  console.error(blocks[1])
  async.map(blocks, function(block, callback) {
    return standard.lintText(block, callback)
  }, done)
}

function extractCodeBlocks(text) {
  const lines = text.split('\n')
  const matches = text.match(blockOpener) || []
  return range(matches.length).map(i => extractBlock(lines, i))
}

// Seek out the nth block of javascript code in the file
function extractBlock(lines, targetIndex) {
  let currentIndex = 0
  let insideBlock = false
  return lines
    .map(line => {
      if (line.match(blockOpener)) {
        if (currentIndex === targetIndex) {
          insideBlock = true
          line = `// ${line}`
        }
        currentIndex++
      }
      if (line.match(blockCloser)) insideBlock = false
      if (!insideBlock) line = `// ${line}`
      return line
    })
    .join('\n')
}
