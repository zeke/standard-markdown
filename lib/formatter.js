'use strict'

const linter = require('./linter')

const formatter = module.exports = {}

formatter.formatFiles = function (files, standardOptions, done) {
  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }
  return linter.lintFiles(files, Object.assign({ fix: true }, standardOptions), done)
}

formatter.formatText = function (text, standardOptions, done) {
  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }
  return linter.lintText(text, Object.assign({ fix: true }, standardOptions), done)
}
