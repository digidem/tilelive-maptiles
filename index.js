var url = require('url')
var qs = require('querystring')
var randomAccessFile = require('random-access-file')
var assert = require('assert')
var mutexify = require('mutexify')
var path = require('path')

var utils = require('./utils')
var readers = require('./lib/readers')
var writers = require('./lib/writers')

module.exports = MapTiles

function MapTiles (uri, callback) {
  if (typeof uri === 'string') uri = url.parse(uri, true)
  else if (typeof uri.query === 'string') uri.query = qs.parse(uri.query)
  var opts = this.opts = uri.query || {}
  assert(!opts.offsetBytes || opts.offsetBytes === 4 || opts.offsetBytes === 8, 'Invalid value for offsetBytes')

  if (!uri.pathname) {
    return callback(new Error('Invalid filename ' + url.format(uri)))
  }

  var filepath = uri.pathname

  if (uri.hostname === '.' || uri.hostname === '..') {
    filepath = path.join(process.cwd(), uri.hostname + filepath)
  }

  var self = this
  self.file = randomAccessFile(filepath)
  self.lock = mutexify()
  self.filepath = filepath

  readers.readHeader(self.file, function (err, header) {
    // It's ok if the file doesn't exist, we may want to write to a new file
    if (err && err.code === 'ENOENT') return callback(null, self)
    if (err) return callback(err)
    if (opts.offsetBytes && header.offsetBytes !== opts.offsetBytes) {
      return callback(new Error('offsetBytes set in options does not match offset bytes of file'))
    }
    self.header = header
    // TODO: check version number
    callback(null, self)
  })
}

MapTiles.prototype.getTile = function (z, x, y, callback) {
  assert(typeof z === 'number')
  assert(typeof x === 'number')
  assert(typeof y === 'number')

  var quadkey = utils.tileToQuadkey([x, y, z])

  readers.readTile(this.file, quadkey, callback)
}

MapTiles.prototype.getInfo = function (callback) {
  readers.readMetadata(this.file, callback)
}

MapTiles.prototype.startWriting = function (callback) {
  // Create a file with the correct header if it doesn't already exist
  if (this.header) return callback()
  var offsetBytes = this.opts.offsetBytes
  var file = this.file
  this.lock(function (release) {
    writers.createFile(file, offsetBytes, release.bind(null, callback))
  })
}

MapTiles.prototype.putInfo = function (info, callback) {
  var file = this.file
  this.lock(function (release) {
    writers.writeMetadata(file, info, release.bind(null, callback))
  })
}

MapTiles.prototype.putTile = function (z, x, y, tile, callback) {
  assert(typeof z === 'number')
  assert(typeof x === 'number')
  assert(typeof y === 'number')
  assert(Buffer.isBuffer(tile))

  var quadkey = utils.tileToQuadkey([x, y, z])
  var file = this.file

  this.lock(function (release) {
    writers.writeTile(file, quadkey, tile, callback)
  })
}
