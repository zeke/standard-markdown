'use strict'

const formatter = require('./lib/formatter')
const linter = require('./lib/linter')

module.exports = {
  formatFiles: formatter.formatFiles,
  formatText: formatter.formatText,
  lintFiles: linter.lintFiles,
  lintText: linter.lintText
}
