var Geometry = require('../lib/geometry');
var Point = require('../lib/point');

var testData = require('./testdata');

var assert = require('assert');

function assertParseWkt(data) {
    assert.deepEqual(Geometry.parse(data.wkt), data.geometry);
}

function assertParseWkb(data) {
    var geometry = data.wkbGeometry ? data.wkbGeometry : data.geometry;
    assert.deepEqual(Geometry.parse(new Buffer(data.wkb, 'hex')), geometry);
}

function assertParseEwkt(data) {
    data.geometry.srid = 4326;
    assert.deepEqual(Geometry.parse('SRID=4326;' + data.wkt), data.geometry);
}

function assertParseEwkb(data) {
    var geometry = data.wkbGeometry ? data.wkbGeometry : data.geometry;
    geometry.srid = 4326;
    assert.deepEqual(Geometry.parse(new Buffer(data.ewkb, 'hex')), geometry);
}

function assertToWkt(data) {
    assert.equal(data.geometry.toWkt(), data.wkt);
}

function assertToWkb(data) {
    assert.equal(data.geometry.toWkb().toString('hex'), data.wkb);
}

function assertToEwkt(data) {
    data.geometry.srid = 4326;
    assert.equal(data.geometry.toEwkt(), 'SRID=4326;' + data.wkt);
}

function assertToEwkb(data) {    
    data.geometry.srid = 4326;
    assert.equal(data.geometry.toEwkb().toString('hex'), data.ewkb);
}

describe('wkx', function () {
    describe('Geometry', function () {
        it('parse(wkt) - coordinate', function () {
            assert.deepEqual(Geometry.parse('POINT(1 2)'), new Point(1, 2));
            assert.deepEqual(Geometry.parse('POINT(1.2 3.4)'), new Point(1.2, 3.4));
            assert.deepEqual(Geometry.parse('POINT(1 3.4)'), new Point(1, 3.4));
            assert.deepEqual(Geometry.parse('POINT(1.2 3)'), new Point(1.2, 3));

            assert.deepEqual(Geometry.parse('POINT(-1 -2)'), new Point(-1, -2));
            assert.deepEqual(Geometry.parse('POINT(-1 2)'), new Point(-1, 2));
            assert.deepEqual(Geometry.parse('POINT(1 -2)'), new Point(1, -2));

            assert.deepEqual(Geometry.parse('POINT(-1.2 -3.4)'), new Point(-1.2, -3.4));
            assert.deepEqual(Geometry.parse('POINT(-1.2 3.4)'), new Point(-1.2, 3.4));
            assert.deepEqual(Geometry.parse('POINT(1.2 -3.4)'), new Point(1.2, -3.4));
        });
        it('parse() - invalid input', function () {
            assert.throws(Geometry.parse, /first argument must be a string or Buffer/);
            assert.throws(function () { Geometry.parse('TEST'); }, /Expected geometry type/);
            assert.throws(function () { Geometry.parse('POINT)'); }, /Expected group start/);
            assert.throws(function () { Geometry.parse('POINT(1 2'); }, /Expected group end/);
            assert.throws(function () { Geometry.parse('POINT(1)'); }, /Expected coordinate pair/);
            assert.throws(function () { Geometry.parse('TEST'); }, /Expected geometry type/);
            assert.throws(function () { Geometry.parse(new Buffer('010800000000000000', 'hex')); }, /GeometryType 8 not supported/);
        });
    });
        
    for (var testKey in testData) {
        (function (testKey) {
            describe(testKey, function () {
                it ('parse(wkt)', function () {
                    assertParseWkt(testData[testKey]);                    
                });
                it ('parse(wkb)', function () {
                    assertParseWkb(testData[testKey]);                    
                });
                it ('parse(ewkt)', function () {
                    assertParseEwkt(testData[testKey]);                    
                });
                it ('parse(ewkb)', function () {
                    assertParseEwkb(testData[testKey]);                    
                });
                it ('toWkt()', function () {
                    assertToWkt(testData[testKey]);                    
                });
                it ('toWkb()', function () {
                    assertToWkb(testData[testKey]);                    
                });
                it ('toEwkt()', function () {
                    assertToEwkt(testData[testKey]);                    
                });
                it ('toEwkb()', function () {
                    assertToEwkb(testData[testKey]);                    
                });
            });
        })(testKey);
    }    
});