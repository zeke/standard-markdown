'use strict'

const fs = require('fs')
const async = require('async')
const flatten = require('lodash.flatten')
const standard = require('standard')
const ora = require('ora')
const extractCodeBlocks = require('./codeBlockUtils').extractCodeBlocks
const disabledRules = [
  'no-undef',
  'no-unused-vars',
  'standard/no-callback-literal',
  'no-unused-expressions',
  'no-lone-blocks',
  'no-labels'
]
const eslintDisable = '/* eslint-disable ' + disabledRules.join(', ') + ' */\n'
const linter = module.exports = {}

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
  const spinner = (files.length > 3) ? ora().start() : {}

  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }
  async.map(files, function (file, callback) {
    spinner.text = 'Linting file ' + (++index) + ' of ' + files.length

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
