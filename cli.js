#!/usr/bin/env node
'use strict'

var fs = require('fs')
var path = require('path')

if (process.versions.node[0] === '0') {
  console.warn('Old version of Node.JS detected, transpiling all node_modules.  THIS COULD TAKE A WHILE')
  require('babel-register')({
    ignore: ['node_modules/babel-register']
  })
  // Patch the path.isAbsolute method
  path.isAbsolute = require('path-is-absolute')
  // Don't ask why.  Just accept that this fixes things (sadpanda)
  var circularJSONPath = path.resolve(__dirname, 'node_modules/standard/node_modules/eslint/node_modules/file-entry-cache/node_modules/flat-cache/node_modules/circular-json/build/circular-json.node.js')
  if (fs.existsSync(circularJSONPath)) {
    fs.writeFileSync(circularJSONPath, fs.readFileSync(circularJSONPath, 'utf8').replace('this.stringify = stringifyRecursion;\nthis.parse = parseRecursion;', 'module.exports={};module.exports.stringify=stringifyRecursion;module.exports.parse=parseRecursion'))
  }
}


var program = require('commander')
var globby = require('globby')
var path = require('path')
var standardMarkdown = require('./')

var patterns = [
  '**/*.md',
  '**/*.markdown',
  '!**/.git/**',
  '!**/coverage/**',
  '!**/dist/**',
  '!**/node_modules/**',
  '!**/vendor/**',
  '!*.min.js',
  '!bundle.js'
]

var cwd

program
  .version(require('./package.json').version)
  .arguments('[cwd]')
  .option('-f, --fix', 'Attempt to fix basic standard JS issues')
  .option('-v, --verbose', 'Verbose mode')
  .action(function (cwdValue) {
    cwd = cwdValue
  })
  .parse(process.argv)

cwd = cwd || process.cwd()

// The files to run our command against
var files = globby.sync(patterns, { cwd: cwd }).map(function (file) {
  return path.resolve(cwd, file)
})

var afterLint = function () {}

// Auto fix the files first if we were told to
if (program.fix) {
  afterLint = function (result) {
    if (result.input !== result.output) {
      console.log('File has changed: ' + result.file)
    }
    fs.writeFileSync(result.file, result.output)
  }
}

// Lint the files
standardMarkdown[program.fix ? 'formatFiles' : 'lintFiles'](files, function (err, results) {
  if (err) throw err

  // No errors
  if (results.every(function (result) { return result.errors.length === 0 })) {
    process.exit(0)
  }

  var lastFilePath
  var totalErrors = 0
  function pad (width, string, padding) {
    return (width <= string.length) ? string : pad(width, string + padding, padding)
  }

  results.forEach(afterLint)

  // Errors!
  results.forEach(function (result) {
    totalErrors += result.errors.length
    result.errors.forEach(function (error) {
      var filepath = path.relative(cwd, result.file)
      if (filepath !== lastFilePath) {
        console.log('\n   ' + filepath)
      }
      lastFilePath = filepath
      console.log('         ' + pad(10, error.line + ':' + error.column + ': ', ' ') + error.message)
    })
  })

  console.log('\nThere are ' + totalErrors + ' errors in "' + cwd + '"')
  process.exit(1)
})
