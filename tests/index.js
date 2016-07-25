const test = require('tape')
const fs = require('fs')
const path = require('path')
const standardMarkdown = require('..')
const dirty = fs.readFileSync(path.join(__dirname, 'fixtures/dirty.md'), 'utf8')

test('standardMarkdown', function (t) {
  standardMarkdown.lintText(dirty, function (err, results) {
    if (err) throw (err)
    // console.error(JSON.stringify(results, null, 2))

    t.equal(results.length, 6, 'returns six linting errors')

    t.equal(results[0].message, "'foo' is defined but never used", 'finds errors')

    t.equal(results[1].message, 'Extra semicolon.', 'finds errors in first block')
    t.equal(results[1].line, 6, 'identifies correct line number in first block')

    t.equal(results[2].message, 'Extra semicolon.', 'finds errors in second block')
    t.equal(results[2].line, 20, 'identifies correct line number in first block')

    t.comment('every result')
    t.ok(results.every(result => result.message.length), 'has a `message` property')
    t.ok(results.every(result => result.line > 0), 'has a `line` property')
    t.ok(results.every(result => result.column > 0), 'has a `column` property')
    t.ok(results.every(result => result.severity > 0), 'has a `severity` property')

    t.end()
  })
})
