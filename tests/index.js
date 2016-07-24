const test = require('tape')
const fs = require('fs')
const path = require('path')
const standardMarkdown = require('..')
const fixture = fs.readFileSync(path.join(__dirname, 'fixture.md'), 'utf8')

test('standardMarkdown', function (t) {
  standardMarkdown(fixture, function(err, results) {
    console.log(results)
    t.end()
  })
})
