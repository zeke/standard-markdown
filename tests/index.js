'use strict'

var test = require('tape')
var fs = require('fs')
var path = require('path')
var standardMarkdown = require('../')
var dirty = fs.readFileSync(path.join(__dirname, 'fixtures/dirty.md'), 'utf8')
var clean = fs.readFileSync(path.join(__dirname, 'fixtures/clean.md'), 'utf8')

test('standardMarkdown', function (t) {
  standardMarkdown.lintText(dirty, function (err, results) {
    if (err) throw err
    // console.error(JSON.stringify(results, null, 2))

    t.comment('dirty fixture')
    t.equal(results.length, 5, 'returns six linting errors')

    t.equal(results[0].message, 'Extra semicolon.', 'finds errors in first block')
    t.equal(results[0].line, 6, 'identifies correct line number in first block')

    t.equal(results[1].message, 'Extra semicolon.', 'finds errors in second block')
    t.equal(results[1].line, 20, 'identifies correct line number in first block')

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
