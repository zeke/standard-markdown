'use strict'

var formatter = require('./lib/formatter')
var linter = require('./lib/linter')

module.exports = {
  formatFiles: formatter.formatFiles,
  formatText: formatter.formatText,
  lintFiles: linter.lintFiles,
  lintText: linter.lintText
}
