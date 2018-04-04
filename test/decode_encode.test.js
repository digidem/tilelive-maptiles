var test = require('tape')

var constants = require('maptiles-spec').constants
var structure = require('maptiles-spec').structure
var utils = require('../lib/utils')
var encodeField = require('../lib/encode_decode').encodeField
var decodeField = require('../lib/encode_decode').decodeField
var parseBlock = require('../lib/encode_decode').parseBlock

var headerGoodFixture = {
  magicNumber: constants.MAGIC_NUMBER,
  version: '1.0.0',
  offsetBits: 32
}

var metadataGoodFixture = {
  type: constants.METADATA_BLOCK,
  id: 'test-tileset-id',
  name: 'My Test Tileset ∑',
  bboxWest: -11.436768,
  bboxSouth: 51.206883,
  bboxEast: -5.240479,
  bboxNorth: 55.460171,
  minZoom: 1,
  maxZoom: 14,
  initialZoom: 6.754,
  initialLon: -8.344116,
  initialLat: 53.386605,
  tileMimeType: 'image/png',
  additionalMetadataOffset: 12355657
}

var indexGoodFixture = {
  type: constants.INDEX_BLOCK,
  firstQuadkey: '0112',
  parentOffset: 125643653,
  depth: 5
}

var tileGoodFixture = {
  type: constants.TILE_BLOCK,
  tileDataLength: 142543,
  hash: Buffer.from('1f8e3e13f4b672673d096e68b75eaf96', 'hex')
}

test('encode/decode header', function (t) {
  var buf = Buffer.alloc(utils.getBlockSize('header'))
  for (var field in headerGoodFixture) {
    encodeField(headerGoodFixture[field], buf, structure.header[field])
  }
  var data = {}
  for (field in headerGoodFixture) {
    data[field] = decodeField(buf, structure.header[field])
  }
  t.deepEqual(data, headerGoodFixture)
  t.deepEqual(parseBlock(buf), headerGoodFixture)
  t.end()
})

test('encode/decode metadata', function (t) {
  var buf = Buffer.alloc(utils.getBlockSize('metadata'))
  for (var field in metadataGoodFixture) {
    encodeField(metadataGoodFixture[field], buf, structure.metadata[field])
  }
  var data = {}
  for (field in metadataGoodFixture) {
    data[field] = decodeField(buf, structure.metadata[field])
  }
  t.deepEqual(data, metadataGoodFixture)
  t.deepEqual(parseBlock(buf), metadataGoodFixture)
  t.end()
})

test('encode/decode indexBlock', function (t) {
  var buf = Buffer.alloc(utils.getBlockSize('indexBlock'))
  for (var field in indexGoodFixture) {
    encodeField(indexGoodFixture[field], buf, structure.indexBlock[field])
  }
  var data = {}
  for (field in indexGoodFixture) {
    data[field] = decodeField(buf, structure.indexBlock[field])
  }
  t.deepEqual(data, indexGoodFixture)
  t.deepEqual(parseBlock(buf), indexGoodFixture)
  t.end()
})

test('encode/decode tileBlock', function (t) {
  var buf = Buffer.alloc(utils.getBlockSize('tileBlock'))
  for (var field in tileGoodFixture) {
    encodeField(tileGoodFixture[field], buf, structure.tileBlock[field])
  }
  var data = {}
  for (field in tileGoodFixture) {
    data[field] = decodeField(buf, structure.tileBlock[field])
  }
  t.deepEqual(data, tileGoodFixture)
  t.deepEqual(parseBlock(buf), tileGoodFixture)
  t.end()
})
