var raf = require('random-access-file')
var writers = require('../lib/writers')
var path = require('path')
var constants = require('maptiles-spec').constants
var structure = require('maptiles-spec').structure

var sizes = require('../lib/utils').blockSizes
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

var file = raf(path.join(__dirname, 'test'))

// writers.createFile(file, 4, console.log)

writers.writeMetadata(file, metadataGoodFixture, console.log)
