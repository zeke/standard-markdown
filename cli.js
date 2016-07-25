#!/usr/bin/env node

const globby = require('globby')
const path = require('path')
const lintFiles = require('.').lintFiles
const cwd = process.cwd()
let patterns = [
  '!**/.git/**',
  '!**/coverage/**',
  '!**/dist/**',
  '!**/node_modules/**',
  '!**/vendor/**',
  '!*.min.js',
  '!bundle.js'
]
const userPattern = process.argv.slice(2)[0]

if (userPattern) {
  patterns.unshift(userPattern)
} else {
  patterns.unshift('**/*.md', '**/*.markdown')
}

const files = globby.sync(patterns, {cwd: cwd})
  .map(file => path.resolve(cwd, file))

lintFiles(files, function (err, results) {
  if (err) throw err

  // No errors
  if (results.every(result => result.errors.length === 0)) {
    process.exit(0)
  }

  // Errors!
  results.forEach(result => {
    result.errors.forEach(error => {
      let filepath = path.relative(cwd, result.file)
      console.log(`${filepath}:${error.line}:${error.column}: ${error.message}`)
    })
  })
  process.exit(1)
})
