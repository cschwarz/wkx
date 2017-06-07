/* jshint evil: true, unused: false */

var eql = require('deep-eql');
var assert = require('assert');

var Geometry = require('../lib/geometry');
var Point = require('../lib/point');
var LineString = require('../lib/linestring');
var Polygon = require('../lib/polygon');
var MultiPoint = require('../lib/multipoint');
var MultiLineString = require('../lib/multilinestring');
var MultiPolygon = require('../lib/multipolygon');
var GeometryCollection = require('../lib/geometrycollection');

var testData = require('./testdata.json');

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

            assert.deepEqual(Geometry.parse('MULTIPOINT(1 2,3 4)'),
                                            new MultiPoint([new Point(1, 2), new Point(3, 4)]));
            assert.deepEqual(Geometry.parse('MULTIPOINT(1 2, 3 4)'),
                                            new MultiPoint([new Point(1, 2), new Point(3, 4)]));
            assert.deepEqual(Geometry.parse('MULTIPOINT((1 2),(3 4))'),
                                            new MultiPoint([new Point(1, 2), new Point(3, 4)]));
            assert.deepEqual(Geometry.parse('MULTIPOINT((1 2), (3 4))'),
                                            new MultiPoint([new Point(1, 2), new Point(3, 4)]));
        });
        it('parse() - invalid input', function () {
            assert.throws(Geometry.parse, /first argument must be a string or Buffer/);
            assert.throws(function () { Geometry.parse('TEST'); }, /Expected geometry type/);
            assert.throws(function () { Geometry.parse('POINT)'); }, /Expected group start/);
            assert.throws(function () { Geometry.parse('POINT(1 2'); }, /Expected group end/);
            assert.throws(function () { Geometry.parse('POINT(1)'); }, /Expected coordinates/);
            assert.throws(function () { Geometry.parse('TEST'); }, /Expected geometry type/);
            assert.throws(function () {
                Geometry.parse(new Buffer('010800000000000000', 'hex'));
            }, /GeometryType 8 not supported/);
            assert.throws(function () {
                Geometry.parseTwkb(new Buffer('a800c09a0c80b518', 'hex'));
            }, /GeometryType 8 not supported/);
            assert.throws(function () {
                Geometry.parseGeoJSON({ type: 'TEST' });
            }, /GeometryType TEST not supported/);
        });
    });

    function parseTest(testData, parseFunc, testProperty) {
        if (!testProperty(testData))
            return;

        var wktResult = testData.results ? testProperty(testData.results) : testData.wkt;
        if (!wktResult)
            wktResult = testData.wkt;        
        assert.equal(parseFunc(testProperty(testData)).toWkt(), wktResult);
    }

    function serializeTest(testData, serializeFunc, resultProperty) {
        if (!resultProperty(testData))
            return;

        var geometry = Geometry.parse(testData.wkt);
        geometry.srid = 4326;
        assert.equal(serializeFunc(geometry), resultProperty(testData));
    }

    function createTest (testKey, testData) {
        it ('parse(wkt)', function () {
            parseTest(testData, d => Geometry.parse(d), d => d.wkt);
        });
        it ('parse(wkb)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.wkb);
        });
        it ('parse(wkb xdr)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.wkbXdr);
        });
        it ('parse(ewkt)', function () {
            parseTest(testData, d => Geometry.parse(d), d => d.ewkt);
        });
        it ('parse(ewkb)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.ewkb);
        });
        it ('parse(ewkb xdr)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.ewkbXdr);
        });
        it ('parse(ewkb no srid)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.ewkbNoSrid);
        });
        it ('parse(ewkb xdr no srid)', function () {
            parseTest(testData, d => Geometry.parse(new Buffer(d, 'hex')), d => d.ewkbXdrNoSrid);
        });
        it ('parseTwkb()', function () {
            parseTest(testData, d => Geometry.parseTwkb(new Buffer(d, 'hex')), d => d.twkb);
        });
        it ('parseGeoJSON()', function () {
            parseTest(testData, d => Geometry.parseGeoJSON(JSON.parse(d)), d => d.geojson);
        });
        it ('toWkt()', function () {
            serializeTest(testData, g => g.toWkt(), d => d.wkt);
        });
        it ('toWkb()', function () {
            serializeTest(testData, g => g.toWkb().toString('hex'), d => d.wkb);
        });
        it ('toEwkt()', function () {
            serializeTest(testData, g => g.toEwkt(), d => d.ewkt);
        });
        it ('toEwkb()', function () {
            serializeTest(testData, g => g.toEwkb().toString('hex'), d => d.ewkb);
        });
        it ('toTwkb()', function () {
            serializeTest(testData, g => g.toTwkb().toString('hex'), d => d.twkb);
        });
        it ('toGeoJSON()', function () {
            serializeTest(testData, g => g.toGeoJSON(), d => d.geojson);
        });
    }

    for (var dimensionKey in testData) {
        describe(dimensionKey, function () {
            for (var testKey in testData[dimensionKey]) {
                describe(testKey, function () {
                    createTest(testKey, testData[dimensionKey][testKey]);
                });
            }
        });
    }
});
