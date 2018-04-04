var assign = require('object-assign')

// var defs = require('./file_structure')
var constants = require('maptiles-spec').constants
var utils = require('./utils')
var encodeBlock = require('./encode_decode').encodeBlock
// var encodeField = require('./encode_decode').encodeField
var readers = require('./readers')

var HEADER_SIZE = utils.getBlockSize('header')
var METADATA_SIZE = utils.getBlockSize('metadata')
// var MAX_HEADER_SIZE = Math.max(utils.getBlockSize('indexBlock'), utils.getBlockSize('tileBlock'))
var INDEX_HEADER_SIZE = utils.getBlockSize('indexBlock')
// var TILE_DATA_OFFSET = defs.tileBlock.data.offset
var MIN_FILE_SIZE = HEADER_SIZE + METADATA_SIZE + INDEX_HEADER_SIZE + 8

var defaultHeader = {
  magicNumber: constants.MAGIC_NUMBER,
  version: '1.0.0',
  metadataOffset: HEADER_SIZE,
  firstIndexOffset: HEADER_SIZE + METADATA_SIZE
}

var defaultMetadata = {
  type: constants.METADATA_BLOCK
}

function createFile (file, offsetBytes, callback) {
  var header = assign({}, defaultHeader, {
    offsetBytes: offsetBytes
  })
  var headerBuf = encodeBlock(header)
  var buf = Buffer.allocUnsafe(MIN_FILE_SIZE).fill(0)
  headerBuf.copy(buf)
  constants.METADATA_BLOCK.copy(buf, defaultHeader.metadataOffset)
  constants.INDEX_BLOCK.copy(buf, defaultHeader.firstIndexOffset)
  file.write(0, buf, callback)
}

function writeMetadata (file, metadata, callback) {
  readers.readHeader(file, function (err, header) {
    if (err) return callback(err)
    readers.readMetadata(file, function (err, existingMetadata) {
      if (err) return callback(err)
      var merged = assign({}, defaultMetadata, existingMetadata, metadata)
      var buf = encodeBlock(merged)
      file.write(header.metadataOffset, buf, callback)
    })
  })
}

function writeTile (file, quadKey, callback) {
  // getIndexOffset
  // writeIndexBlock
  // writeTile
}

module.exports = {
  createFile: createFile,
  writeMetadata: writeMetadata,
  writeTile: writeTile
}
