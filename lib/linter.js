'use strict'

var async = require('async')
var fs = require('fs')
var flatten = require('lodash.flatten')
var standard = require('standard')

var extractCodeBlocks = require('./codeBlockUtils').extractCodeBlocks

var disabledRules = ['no-undef', 'no-unused-vars', 'no-lone-blocks', 'no-labels']

var linter = module.exports = {}

linter.lintText = function (text, done) {
  var blocks = extractCodeBlocks(text)
  async.map(blocks, function (block, callback) {
    var ignoredBlock = '/* eslint-disable ' + disabledRules.join(', ') + ' */\n' + block
    return standard.lintText(ignoredBlock, callback)
  }, function (err, results) {
    if (err) return done(err)
    results = results.map(function (r) {
      return r.results.map(function (res) {
        return res.messages.map(function (message) {
          // We added an extra line to the top of the "file" so we need to remove one here
          message.line -= 1
          return message
        })
      })
    })
    results = flatten(flatten(results))
    return done(null, results)
  })
}

linter.lintFiles = function (files, done) {
  var index = 0
  async.map(files, function (file, callback) {
    // Inform the user of progress
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write('Linting file ' + (index++ + 1) + ' of ' + files.length)

    linter.lintText(fs.readFileSync(file, 'utf8'), function (err, errors) {
      if (err) return callback(err)
      return callback(null, { file: file, errors: errors })
    })
  }, function (err, results) {
    if (err) return done(err)
    return done(null, results)
  })
}
