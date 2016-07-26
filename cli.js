#!/usr/bin/env node
'use strict'

var globby = require('globby')
var path = require('path')
var lintFiles = require('./').lintFiles
var cwd = process.argv.slice(2)[0] || process.cwd()
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

lintFiles(files, function (err, results) {
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
