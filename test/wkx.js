var Geometry = require('../lib/geometry');
var Point = require('../lib/point');

var testData = require('./testdata');

var assert = require('assert');

function assertParseWkt(data) {
    assert.deepEqual(Geometry.parse(data.wkt), data.geometry);
}

function assertParseWkb(data) {
    assert.deepEqual(Geometry.parse(new Buffer(data.wkb, 'hex')), data.geometry);
}

function assertToWkt(data) {
    assert.equal(data.geometry.toWkt(), data.wkt);
}

function assertToWkb(data) {
    assert.equal(data.geometry.toWkb().toString('hex'), data.wkb);
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
        it('parse(wkt)', function () {
            assertParseWkt(testData.emptyPoint);
            assertParseWkt(testData.point);

            assertParseWkt(testData.emptyLineString);
            assertParseWkt(testData.lineString);

            assertParseWkt(testData.emptyPolygon);
            assertParseWkt(testData.polygon);
            assertParseWkt(testData.polygonWithOneInteriorRing);
            assertParseWkt(testData.polygonWithTwoInteriorRings);

            assertParseWkt(testData.emptyMultiPoint);
            assertParseWkt(testData.multiPointWithOnePoint);
            assertParseWkt(testData.multiPointWithTwoPoints);

            assertParseWkt(testData.emptyMultiLineString);
            assertParseWkt(testData.multiLineStringWithOneLineString);
            assertParseWkt(testData.multiLineStringWithTwoLineStrings);

            assertParseWkt(testData.emptyMultiPolygon);
            assertParseWkt(testData.multiPolygonWithOnePolygon);
            assertParseWkt(testData.multiPolygonWithTwoPolygons);

            assertParseWkt(testData.emptyGeometryCollection);
            assertParseWkt(testData.geometryCollectionWithPoint);
            assertParseWkt(testData.geometryCollectionWithPointAndLineString);
            assertParseWkt(testData.geometryCollectionWithPointAndLineStringAndPolygon);
        });
        it('parse(wkb)', function () {
            assertParseWkb(testData.point);

            assertParseWkb(testData.emptyLineString);
            assertParseWkb(testData.lineString);

            assertParseWkb(testData.emptyPolygon);
            assertParseWkb(testData.polygon);
            assertParseWkb(testData.polygonWithOneInteriorRing);
            assertParseWkb(testData.polygonWithTwoInteriorRings);

            assertParseWkb(testData.emptyMultiPoint);
            assertParseWkb(testData.multiPointWithOnePoint);
            assertParseWkb(testData.multiPointWithTwoPoints);

            assertParseWkb(testData.emptyMultiLineString);
            assertParseWkb(testData.multiLineStringWithOneLineString);
            assertParseWkb(testData.multiLineStringWithTwoLineStrings);

            assertParseWkb(testData.emptyMultiPolygon);
            assertParseWkb(testData.multiPolygonWithOnePolygon);
            assertParseWkb(testData.multiPolygonWithTwoPolygons);

            assertParseWkb(testData.emptyGeometryCollection);
            assertParseWkb(testData.geometryCollectionWithPoint);
            assertParseWkb(testData.geometryCollectionWithPointAndLineString);
            assertParseWkb(testData.geometryCollectionWithPointAndLineStringAndPolygon);
        });
        it('parse(wkb) - big endian', function () {
            assertParseWkb(testData.pointBigEndian);
        });
        it('parse() - invalid input', function () {
            assert.throws(Geometry.parse, /first argument must be a string or Buffer/);
            assert.throws(function () { Geometry.parse('TEST'); }, /Expected geometry type/);
            assert.throws(function () { Geometry.parse(new Buffer('010800000000000000', 'hex')); }, /GeometryType 8 not supported/);
        });
    });
	describe('Point', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyPoint);
            assertToWkt(testData.point);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyPoint);
            assertToWkb(testData.point);
		});
	});
    describe('LineString', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyLineString);
            assertToWkt(testData.lineString);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyLineString);
            assertToWkb(testData.lineString);
		});
	});
    describe('Polygon', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyPolygon);
            assertToWkt(testData.polygon);
            assertToWkt(testData.polygonWithOneInteriorRing);
            assertToWkt(testData.polygonWithTwoInteriorRings);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyPolygon);
            assertToWkb(testData.polygon);
            assertToWkb(testData.polygonWithOneInteriorRing);
            assertToWkb(testData.polygonWithTwoInteriorRings);
		});
	});
    describe('MultiPoint', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyMultiPoint);
            assertToWkt(testData.multiPointWithOnePoint);
            assertToWkt(testData.multiPointWithTwoPoints);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyMultiPoint);
            assertToWkb(testData.multiPointWithOnePoint);
            assertToWkb(testData.multiPointWithTwoPoints);
		});
	});
    describe('MultiLineString', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyMultiLineString);
            assertToWkt(testData.multiLineStringWithOneLineString);
            assertToWkt(testData.multiLineStringWithTwoLineStrings);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyMultiLineString);
            assertToWkb(testData.multiLineStringWithOneLineString);
            assertToWkb(testData.multiLineStringWithTwoLineStrings);
		});
	});
    describe('MultiPolygon', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyMultiPolygon);
            assertToWkt(testData.multiPolygonWithOnePolygon);
            assertToWkt(testData.multiPolygonWithTwoPolygons);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyMultiPolygon);
            assertToWkb(testData.multiPolygonWithOnePolygon);
            assertToWkb(testData.multiPolygonWithTwoPolygons);
		});
	});
    describe('GeometryCollection', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyGeometryCollection);
            assertToWkt(testData.geometryCollectionWithPoint);
            assertToWkt(testData.geometryCollectionWithPointAndLineString);
            assertToWkt(testData.geometryCollectionWithPointAndLineStringAndPolygon);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyGeometryCollection);
            assertToWkb(testData.geometryCollectionWithPoint);
            assertToWkb(testData.geometryCollectionWithPointAndLineString);
            assertToWkb(testData.geometryCollectionWithPointAndLineStringAndPolygon);
		});
	});
});