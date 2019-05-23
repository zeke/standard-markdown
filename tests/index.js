'use strict'

var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
var fs = require('fs')
var path = require('path')
var standardMarkdown = require('../')
var dirty = fs.readFileSync(path.join(__dirname, 'fixtures/dirty.md'), 'utf8')
var clean = fs.readFileSync(path.join(__dirname, 'fixtures/clean.md'), 'utf8')
var cleanable = fs.readFileSync(path.join(__dirname, 'fixtures/cleanable.md'), 'utf8')

test('standardMarkdownFormat', function (t) {
  t.comment('cleaning the dirty fixture')

  return standardMarkdown.formatText(cleanable).then((data) => {
    t.equal(data.results.length, 0, 'should remove all linting errors from the cleanable fixture')
    t.equal(cleanable.split('\n').length, data.outputText.split('\n').length, 'should keep the same number of lines')
    t.ok(!/```(js|javascript)\n\(([{|[][\s\S]+[}|\]])\)\n```/mgi.test(data.outputText), 'should remove the magic parenthesis when formatting')
  }).catch((cleanErr) => {
    throw cleanErr
  })
})

test('standardMarkdown', function (t) {
  return standardMarkdown.lintText(dirty).then((data) => {
    const results = data.results

    t.comment('dirty fixture')
    t.equal(results.length, 5, 'returns six linting errors')

    t.equal(results[0].message, 'Extra semicolon.', 'finds errors in first block')
    t.equal(results[0].line, 6, 'identifies correct line number in first block')

    t.equal(results[1].message, 'Extra semicolon.', 'finds errors in second block')
    t.equal(results[1].line, 20, 'identifies correct line number in second block')

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

    standardMarkdown.lintText(clean).then((data) => {
      const results = data.results
      t.equal(results.length, 0, 'has no errors')
    }).catch((err) => {
      throw err
    })
  }).catch((err) => {
    throw err
  })
})
