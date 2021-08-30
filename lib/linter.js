'use strict'

const fs = require('fs')
const standard = require('standard')
const ora = require('ora')
const { extractCodeBlocks } = require('./codeBlockUtils')
const disabledRules = [
  'no-labels',
  'no-lone-blocks',
  'no-undef',
  'no-unused-expressions',
  'no-unused-vars',
  'node/no-callback-literal'
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
  let outputText = text

  const blocks = extractCodeBlocks(text)
  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }

  return Promise.all(blocks.map((block) => {
    const ignoredBlock = eslintDisable + wrapOrphanObjectInParens(block.code)
    return new Promise((resolve, reject) => {
      standard.lintText(ignoredBlock, standardOptions, (err, results) => {
        if (err) return reject(err)
        results.originalLine = block.line
        results.originalText = block
        return resolve(results)
      })
    })
  })).then((results) => {
    results = results.map((r) => {
      return r.results.map((res) => {
        if (res.output) {
          outputText = outputText.replace(
            r.originalText.code,
            removeParensWrappingOrphanedObject(res.output.replace(eslintDisable, ''))
          )
        }
        return res.messages.map((message) => {
          // We added an extra line to the top of the "file" so we need to remove one here
          message.line += r.originalLine
          return message
        })
      })
    })
    results = results.flat(Infinity)
    return done(null, results, outputText)
  }).catch((err) => {
    return done(err)
  })
}

linter.lintFiles = function (files, standardOptions, done) {
  let index = 0
  const spinner = (files.length > 3) ? ora().start() : {}

  if (typeof standardOptions === 'function') {
    done = standardOptions
    standardOptions = {}
  }
  return Promise.all(files.map((file) => {
    spinner.text = 'Linting file ' + (++index) + ' of ' + files.length

    return new Promise((resolve, reject) => {
      linter.lintText(fs.readFileSync(file, 'utf8'), standardOptions, (err, errors, outputText) => {
        if (err) return reject(err)
        return resolve({
          file: file,
          errors: errors,
          input: fs.readFileSync(file, 'utf8'),
          output: outputText
        })
      })
    })
  })).then((results) => {
    console.log('\n')
    return done(null, results)
  }).catch((err) => {
    return done(err)
  })
}
