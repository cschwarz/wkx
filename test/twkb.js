var Point = require('../lib/point');

var assert = require('assert');

describe('wkx', function () {
    describe('toTwkb', function () {
        it('Point small', function () {
            assert.equal(new Point(1, 2).toTwkb().toString('hex'), 'a100c09a0c80b518');
        });
        it('Point large', function () {
            assert.equal(new Point(10000, 20000).toTwkb().toString('hex'), 'a10080a8d6b90780d0acf30e');
        });
    });
});
