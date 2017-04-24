'use strict'

var fs = require('fs')

var async = require('async')
var flatten = require('lodash.flatten')
var standard = require('standard')

var extractCodeBlocks = require('./codeBlockUtils').extractCodeBlocks

var disabledRules = ['no-undef', 'no-unused-vars', 'no-lone-blocks', 'no-labels']
var eslintDisable = '/* eslint-disable ' + disabledRules.join(', ') + ' */\n'

var linter = module.exports = {}

function removeParensWrappingOrphanedObject (block) {
  return block.replace(
    /^\(([{|[][\s\S]+[}|\]])\)$/mg,
    '$1'
  )
}

function wrapOrphanObjectInParens (block) {
  return block.replace(
    /^([{|[][\s\S]+[}|\]])$/mg,
    '($1)'
  )
}

linter.lintText = function (text, standardOptions, done) {
  var outputText = text

  var blocks = extractCodeBlocks(text)
  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }

  async.map(blocks, function (block, callback) {
    var ignoredBlock = eslintDisable + wrapOrphanObjectInParens(block.code)
    standard.lintText(ignoredBlock, standardOptions, function (err, results) {
      if (err) return callback(err)
      results.originalLine = block.line
      results.originalText = block
      callback(err, results)
    })
  }, function (err, results) {
    if (err) return done(err)
    results = results.map(function (r) {
      return r.results.map(function (res) {
        if (res.output) {
          outputText = outputText.replace(r.originalText.code, removeParensWrappingOrphanedObject(res.output.replace(eslintDisable, '')))
        }
        return res.messages.map(function (message) {
          // We added an extra line to the top of the "file" so we need to remove one here
          message.line += r.originalLine
          return message
        })
      })
    })
    results = flatten(flatten(results))
    return done(null, results, outputText)
  })
}

linter.lintFiles = function (files, standardOptions, done) {
  var index = 0
  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }
  async.map(files, function (file, callback) {
    // Inform the user of progress
    if (process.stdout.clearLine && process.stdout.cursorTo) {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
    }

    if (standardOptions.verbose) {
      process.stdout.write('Linting file ' + (index++ + 1) + ' of ' + files.length + '\n')
    }
    
    linter.lintText(fs.readFileSync(file, 'utf8'), standardOptions, function (err, errors, outputText) {
      if (err) return callback(err)
      return callback(null, { file: file, errors: errors, input: fs.readFileSync(file, 'utf8'), output: outputText })
    })
  }, function (err, results) {
    if (err) return done(err)
    console.log('\n')
    return done(null, results)
  })
}
