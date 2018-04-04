var uint64be = require('uint64be')

var defs = require('maptiles-spec').structure
var constants = require('maptiles-spec').constants
var utils = require('./utils')
var parseBlock = require('./encode_decode').parseBlock

var HEADER_SIZE = utils.getBlockSize('header')
var METADATA_SIZE = utils.getBlockSize('metadata')
var MAX_HEADER_SIZE = Math.max(utils.getBlockSize('indexBlock'), utils.getBlockSize('tileBlock'))
var INDEX_HEADER_SIZE = utils.getBlockSize('indexBlock')
var TILE_DATA_OFFSET = defs.tileBlock.data.offset

function readHeader (file, callback) {
  readAndParseBlock(file, 0, HEADER_SIZE, function (err, header) {
    if (err) return callback(err)
    if (!header.magicNumber || !header.magicNumber.equals(constants.MAGIC_NUMBER)) {
      return callback(new Error('Unrecognized filetype'))
    }
    callback(null, header)
  })
}

function readMetadata (file, callback) {
  readHeader(file, function (err, header) {
    if (err) return callback(err)
    readAndParseBlock(file, header.metadataOffset, METADATA_SIZE, callback)
  })
}

function readFirstIndexOffset (file, callback) {
  readMetadata(file, onReadMetadata)

  function onReadMetadata (err, metadata, metadataOffset) {
    if (err) return callback(err)
    var firstBlockOffset = metadataOffset + metadata.length
    readAndParseBlock(file, firstBlockOffset, 5, onParseBlock)
  }

  function onParseBlock (err, block, offset) {
    if (err) return callback(err)
    if (constants.INDEX_BLOCK.equals(block.type)) {
      return callback(null, offset)
    } else if (!block.length) {
      return callback(new Error('Could not find Index Block in file'))
    }
    readAndParseBlock(file, offset, 5, onParseBlock)
  }
}

function readTile (file, quadkey, callback) {
  readFirstIndexOffset(file, function (err, indexOffset) {
    if (err) return callback(err)
    readAndParseBlock(file, indexOffset, MAX_HEADER_SIZE, onParseBlock)
  })

  function onParseBlock (err, block, offset) {
    if (err) return callback(err)
    if (constants.TILE_BLOCK.equals(block.type)) {
      return file.read(offset + TILE_DATA_OFFSET, block.length, callback)
    }
    if (!constants.INDEX_BLOCK.equals(block.type)) {
      return callback(new Error('Unexpected block type ' + block.type))
    }
    if (quadkey.length <= block.firstQuadkey.length &&
      quadkey !== block.firstQuadkey) {
      if (block.parentOffset) {
        return readAndParseBlock(file, block.parentOffset, MAX_HEADER_SIZE, onParseBlock)
      } else {
        return callback(new Error('NotFound'))
      }
    }
    readTileOffsetFromIndex(file, quadkey, block, offset, function (err, nextOffset) {
      if (err) return callback(err)
      if (!nextOffset) return callback(new Error('NotFound'))
      readAndParseBlock(file, nextOffset, MAX_HEADER_SIZE, onParseBlock)
    })
  }
}

function readTileOffsetFromIndex (file, quadkey, indexInfo, indexOffset, callback) {
  var indexPosition = utils.getIndexPosition(
    quadkey,
    indexInfo.firstTileQuadkey,
    indexInfo.depth
  )
  if (typeof indexPosition === 'undefined') {
    return callback(new Error('NotFound'))
  }
  // This is the offset in the file of a 4 or 8 byte buffer in the index that
  // contains the offset of the tile.
  var tileOffsetOffset = indexOffset + INDEX_HEADER_SIZE +
    (indexPosition * indexInfo.entryLength)
  file.read(tileOffsetOffset, indexInfo.entryLength, function (err, buf) {
    if (err) return callback(err)
    var offset = (buf.length === 4)
      ? buf.readUInt32BE(0)
      : uint64be.decode(buf, 0)
    callback(null, offset)
  })
}

function readAndParseBlock (file, offset, length, callback) {
  file.read(offset, length, function (err, buf) {
    if (err) return callback(err)
    try {
      var parsed = parseBlock(buf)
    } catch (e) {
      return callback(e)
    }
    callback(null, parsed, offset)
  })
}

module.exports = {
  readHeader: readHeader,
  readMetadata: readMetadata,
  readTile: readTile
}
