var BinaryWriter = require('../lib/binarywriter');

var assert = require('assert');

describe('wkx', function () {
    describe('BinaryWriter', function () {
        it('writeVarInt - 1', function () {
            var binaryWriter = new BinaryWriter(1);
            var length = binaryWriter.writeVarInt(1);

            assert.equal(binaryWriter.buffer.toString('hex'), '01');
            assert.equal(length, 1);
        });
        it('writeVarInt - 300', function () {
            var binaryWriter = new BinaryWriter(2);
            var length = binaryWriter.writeVarInt(300);

            assert.equal(binaryWriter.buffer.toString('hex'), 'ac02');
            assert.equal(length, 2);
        });
    });
});
