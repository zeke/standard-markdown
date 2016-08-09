#!/usr/bin/env node
'use strict'

var program = require('commander')
var fs = require('fs')
var globby = require('globby')
var mkdirp = require('mkdirp')
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
  .option('-a, --auto-fix', 'Attempt to fix basic standard JS issues')
  .option('-s, --safe-run', 'Used in combination with "--auto-fix" this will generate new files in an "dry_run" directory instead of overwriting old ones')
  .option('-v, --verbose', 'Verbose mode')
  .action(function (cwdValue) {
    cwd = cwdValue || process.cwd()
  })
  .parse(process.argv)

if (program.dryRun && !program.autoFix) {
  console.error('Can\'t use "--dry-run" without using "--auto-fix"')
  process.exit(1)
}

// The files to run our command against
var files = globby.sync(patterns, { cwd: cwd }).map(function (file) {
  return path.resolve(cwd, file)
})

var targetDir = path.resolve(cwd)

// Auto fix the files first if we were told to
if (program.autoFix) {
  if (program.dryRun) targetDir = path.resolve(cwd, '..', path.basename(path.resolve(cwd)) + '_dry_run')

  // Format all the files
  var formattedFiles = standardMarkdown.formatFiles(files, program.verbose)
  console.log(' ')

  // Determine if each file has changed and write all files to the correct destination
  formattedFiles.forEach(function (result) {
    if (result.originalText !== result.cleanText) {
      console.log('File has changed: ' + result.file)
    }
    var targetFile = result.file.replace(path.resolve(cwd), targetDir)
    mkdirp.sync(path.dirname(targetFile))
    fs.writeFileSync(targetFile, result.cleanText)
  })
}

// If we just did a dry run we need to correct the file set we lint against
if (program.dryRun) {
  files = globby.sync(patterns, { cwd: targetDir }).map(function (file) {
    return path.resolve(cwd, file)
  })
}

// Lint the files
standardMarkdown.lintFiles(files, function (err, results) {
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
