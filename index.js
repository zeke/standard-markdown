const eslint = require('eslint')
const standard = require('standard')
const range = require('lodash.range')
const flatten = require('lodash.flatten')
const async = require('async')
const blockOpener = /^```(js|javascript)$/mg
const blockCloser = /^```$/mg

let standardMarkdown = module.exports = {}

standardMarkdown.lintText = function (text, done) {
  const blocks = extractCodeBlocks(text)
  async.map(
    blocks,
    function(block, callback) { return standard.lintText(block, callback) },
    function(err, results) {
      if (err) return done(err)
      results = results.map(r => r.results.map(res => res.messages))
      results = flatten(flatten(results))
      return done(null, results)
    }
  )
}

function extractCodeBlocks(text) {
  const lines = text.split('\n')
  const matches = text.match(blockOpener) || []
  return range(matches.length).map(index => extractCodeBlock(lines, index))
}

// Seek out the nth block of javascript code in the file
function extractCodeBlock(lines, targetIndex) {
  let currentIndex = 0
  let insideBlock = false
  return lines
    .map(line => {
      // standard doesn't like trailing whitespace
      line = line.trim()

      if (line.match(blockOpener)) {
        if (currentIndex === targetIndex) {
          insideBlock = true
          line = `// -${line}`
        }
        currentIndex++
      }
      if (line.match(blockCloser)) insideBlock = false
      if (!insideBlock) line = `// -${line}`
      return line
    })
    .join('\n')
    .concat('\n') // standard requires a newline at end of file
}
