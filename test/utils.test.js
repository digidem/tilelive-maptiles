var test = require('tape')

var utils = require('../lib/utils')

test('zeroTrim', function (t) {
  var trim = utils.zeroTrim
  t.equal(trim('foo'), 'foo')
  t.equal(trim('\u0000\u0000foo'), 'foo')
  t.equal(trim('\u0000\u0000\u0000'), '')
  t.equal(trim(''), '')
  t.equal(trim('a'), 'a')
  t.equal(trim(0), '0')
  t.equal(trim('foo\u0000\u0000'), 'foo')
  t.equal(trim('a\u0000\u0000b'), 'a\u0000\u0000b')
  t.equal(trim('\u0000foo\u0000bar\u0000'), 'foo\u0000bar')
  t.end()
})

test('zeroPad', function (t) {
  var pad = utils.zeroPad
  t.equal(pad(Buffer.from('foo'), 2).toString(), 'foo')
  t.equal(pad(Buffer.from('foo'), 3).toString(), 'foo')
  t.equal(pad(Buffer.from('foo'), 3).toString(), 'foo')
  t.equal(pad(Buffer.from('∑'), 3).toString(), '∑')
  t.equal(pad(Buffer.from('foo'), 5).toString(), '\u0000\u0000foo')
  t.equal(pad(Buffer.from('∑'), 5).toString(), '\u0000\u0000∑')
  t.end()
})

test('assertMatch', function (t) {
  var assertMatch = utils.assertMatch
  t.error(assertMatch('foo'))
  t.throws(assertMatch.bind(null, 'foo', 'df'))
  t.error(assertMatch('foo', 'foo'))
  t.error(assertMatch(5, 5))
  t.throws(assertMatch.bind(null, 5, 4))
  t.error(assertMatch('foo', ['foo', 'bar']))
  t.error(assertMatch(32, [32, 64]))
  t.throws(assertMatch.bind(null, 5, [1, 2]))
  t.throws(assertMatch.bind(null, 'foo', ['df', 'dk']))
  t.error(assertMatch('foo', function (v) { return /foo/.test(v) }))
  t.throws(assertMatch.bind(null, 'foo', function (v) { return /df/.test(v) }))
  t.error(assertMatch(Buffer.from('foo'), Buffer.from('foo')))
  t.throws(assertMatch.bind(null, Buffer.from('foo'), Buffer.from('df')))
  t.throws(assertMatch.bind(null, 'foo', true))
  t.throws(assertMatch.bind(null, 'foo', {}))
  t.end()
})

test('get quadkey', function (t) {
  var key = utils.tileToQuadkey([11, 3, 8])
  t.equal(key, '00001033')
  t.equal(utils.tileToQuadkey([0, 0, 0]), '')
  t.end()
})

test('quadkey to tile', function (t) {
  var quadkey = '00001033'
  var tile = utils.quadkeyToTile(quadkey)
  t.equal(tile.length, 3)
  t.deepEqual(tile, [11, 3, 8])
  t.deepEqual(utils.quadkeyToTile(''), [0, 0, 0])
  t.end()
})
