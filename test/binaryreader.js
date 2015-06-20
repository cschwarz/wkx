var BinaryReader = require('../lib/binaryreader');

var assert = require('assert');

describe('wkx', function () {
    describe('BinaryReader', function () {
        it('readVarInt', function () {
            assert.equal(1, new BinaryReader(new Buffer('01', 'hex')).readVarInt());
            assert.equal(300, new BinaryReader(new Buffer('ac02', 'hex')).readVarInt());
        });
    });
});
