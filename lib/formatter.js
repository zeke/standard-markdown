'use strict'

var linter = require('./linter')

var formatter = module.exports = {}

formatter.formatFiles = function (files, standardOptions) {
  return linter.lintFiles(files, Object.assign({ fix: true }, standardOptions))
}

formatter.formatText = function (text, standardOptions) {
  return linter.lintText(text, Object.assign({ fix: true }, standardOptions))
}
