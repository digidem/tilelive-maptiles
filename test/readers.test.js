var raf = require('random-access-file')
var readers = require('../lib/readers')
var path = require('path')

var file = raf(path.join(__dirname, 'test'))

readers.readMetadata(file, console.log)
