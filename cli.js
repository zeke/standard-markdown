#!/usr/bin/env node

const globby = require('globby')
const path = require('path')
const lintFiles = require('.').lintFiles
const patterns = [
  '**/*.md',
  '**/*.markdown',
  '!**/node_modules/**',
  '!**/vendor/**',
  '!**/.git/**'
]
const cwd = process.argv.slice(2)[0] || process.cwd()
const files = globby.sync(patterns, {cwd: cwd})
  .map(file => path.resolve(cwd,file))

lintFiles(files, function (err, results) {
  if (err) throw err

  if (results.every(result => result.errors.length === 0)) {
    process.exit(0)
  }

  results.forEach(result => {
    result.errors.forEach(error => {
      let filepath = path.relative(cwd, result.file)
      console.log(`${filepath}:${error.line}:${error.column}: ${error.message}`)
    })
  })

  process.exit(1)
})
