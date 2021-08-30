#!/usr/bin/env node
'use strict'

const fs = require('fs')
const globby = require('globby')
const path = require('path')
const program = require('commander')
const standardMarkdown = require('./')

let patterns = [
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

let cwd

program
  .version(require('./package.json').version)
  .arguments('[cwd] [patterns...]')
  .option('-f, --fix', 'Attempt to fix basic standard JS issues')
  .option('-v, --verbose', 'Verbose mode')
  .action(function (cwdValue, patternArgs) {
    if (cwdValue == null) return
    // If cwd is an actual path, set it to be the cwd
    // Otherwise interpret it as a glob pattern
    if (fs.existsSync(path.resolve(cwdValue)) && fs.lstatSync(path.resolve(cwdValue)).isDirectory()) {
      cwd = cwdValue
    } else {
      if (cwdValue) {
        patterns = [cwdValue].concat(patternArgs).concat(patterns.slice(2))
      }
    }
  })
  .parse(process.argv)

cwd = cwd || process.cwd()

// The files to run our command against
const files = globby.sync(patterns, { cwd: cwd }).map(function (file) {
  return path.resolve(cwd, file)
})

let afterLint = function () {}

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

  let lastFilePath
  let totalErrors = 0
  function pad (width, string, padding) {
    return (width <= string.length) ? string : pad(width, string + padding, padding)
  }

  results.forEach(afterLint)

  // Errors!
  results.forEach(function (result) {
    totalErrors += result.errors.length
    result.errors.forEach(function (error) {
      const filepath = path.relative(cwd, result.file)
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
