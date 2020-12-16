'use strict'

const test = require('tape')
const fs = require('fs')
const path = require('path')
const standardMarkdown = require('../')
const dirty = fs.readFileSync(path.join(__dirname, 'fixtures/dirty.md'), 'utf8')
const clean = fs.readFileSync(path.join(__dirname, 'fixtures/clean.md'), 'utf8')
const cleanable = fs.readFileSync(path.join(__dirname, 'fixtures/cleanable.md'), 'utf8')

test('standardMarkdownFormat', function (t) {
  t.comment('cleaning the dirty fixture')

  standardMarkdown.formatText(cleanable, function (cleanErr, results, cleanText) {
    if (cleanErr) throw cleanErr

    t.equal(results.length, 0, 'should remove all linting errors from the cleanable fixture')
    t.equal(cleanable.split('\n').length, cleanText.split('\n').length, 'should keep the same number of lines')
    t.ok(!/```(js|javascript)\n\(([{|[][\s\S]+[}|\]])\)\n```/mgi.test(cleanText), 'should remove the magic parenthesis when formatting')

    t.end()
  })
})

test('standardMarkdown', function (t) {
  standardMarkdown.lintText(dirty, function (err, results) {
    if (err) throw err

    t.comment('dirty fixture')
    t.equal(results.length, 7, 'returns 7 linting errors')

    t.equal(results[0].message, 'Unexpected var, use let or const instead.')
    t.equal(results[0].line, 6, 'identifies correct line number in first block')

    t.equal(results[1].message, 'Extra semicolon.', 'finds errors in second block')
    t.equal(results[1].line, 6, 'identifies correct line number in second block')

    t.equal(results[3].message, 'Extra semicolon.', 'finds errors in second block')
    t.equal(results[3].line, 20, 'identifies correct line number in second block')

    t.comment('every error')
    t.ok(results.every(function (result) {
      return result.message.length
    }), 'has a `message` property')
    t.ok(results.every(function (result) {
      return result.line > 0
    }), 'has a `line` property')
    t.ok(results.every(function (result) {
      return result.column > 0
    }), 'has a `column` property')
    t.ok(results.every(function (result) {
      return result.severity > 0
    }), 'has a `severity` property')

    t.comment('clean fixture')
    standardMarkdown.lintText(clean, function (err, results) {
      if (err) throw err
      t.equal(results.length, 0, 'has no errors')
      t.end()
    })
  })
})
