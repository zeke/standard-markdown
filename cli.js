#!/usr/bin/env node
'use strict'

var fs = require('fs')
var globby = require('globby')
var mkdirp = require('mkdirp')
var path = require('path')
var standardMarkdown = require('./')
var cwd = process.argv.slice(2)[0] || process.cwd()
var autoFix = process.argv.slice(3)[0] === '--auto-fix'
var dryRun = process.argv.slice(4)[0] === '--dry-run'
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

var files = globby.sync(patterns, { cwd: cwd }).map(function (file) {
  return path.resolve(cwd, file)
})

if (autoFix) {
  var targetDir = path.resolve(cwd)
  if (dryRun) targetDir = path.resolve(cwd, '..', path.basename(path.resolve(cwd)) + '_dry_run')

  var formattedFiles = standardMarkdown.formatFiles(files)
  console.log(' ')

  formattedFiles.forEach(function (result) {
    if (result.originalText !== result.cleanText) {
      console.log('File has changed: ' + result.file)
    }
    var targetFile = result.file.replace(path.resolve(cwd), targetDir)
    mkdirp.sync(path.dirname(targetFile))
    fs.writeFileSync(targetFile, result.cleanText)
  })
} else {
  standardMarkdown.lintFiles(files, function (err, results) {
    if (err) throw err

    // No errors
    if (results.every(function (result) { return result.errors.length === 0 })) {
      process.exit(0)
    }

    // Errors!
    results.forEach(function (result) {
      result.errors.forEach(function (error) {
        var filepath = path.relative(cwd, result.file)
        console.log(filepath + ':' + error.line + ':' + error.column + ': ' + error.message)
      })
    })
    process.exit(1)
  })
}
