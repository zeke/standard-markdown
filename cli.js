#!/usr/bin/env node
'use strict'

var fs = require('fs')
var globby = require('globby')
var path = require('path')
var program = require('commander')
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
  .option('-p, --pattern [pattern]', 'Glob pattern to match markdown files to lint')
  .option('-i, --ignore [ignore]', 'Glob pattern to match markdown files to ignore')
  .option('-v, --verbose', 'Verbose mode')
  .action(function (cwdValue) {
    cwd = cwdValue
  })
  .parse(process.argv)

cwd = cwd || process.cwd()

if (program.pattern) {
  patterns.pop(0)
  patterns[0] = program.pattern
}

if (program.ignore) {
  patterns.push(`!${program.ignore}`)
}

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
