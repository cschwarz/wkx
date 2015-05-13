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

function assertParseEwkt(data) {
    data.geometry.srid = 4326;
    assert.deepEqual(Geometry.parse('SRID=4326;' + data.wkt), data.geometry);
}

function assertParseEwkb(data) {
    data.geometry.srid = 4326;
    assert.deepEqual(Geometry.parse(new Buffer(data.ewkb, 'hex')), data.geometry);
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
        it('parse(ewkt)', function () {
            assertParseEwkt(testData.emptyPoint);
            assertParseEwkt(testData.point);

            assertParseEwkt(testData.emptyLineString);
            assertParseEwkt(testData.lineString);

            assertParseEwkt(testData.emptyPolygon);
            assertParseEwkt(testData.polygon);
            assertParseEwkt(testData.polygonWithOneInteriorRing);
            assertParseEwkt(testData.polygonWithTwoInteriorRings);

            assertParseEwkt(testData.emptyMultiPoint);
            assertParseEwkt(testData.multiPointWithOnePoint);
            assertParseEwkt(testData.multiPointWithTwoPoints);

            assertParseEwkt(testData.emptyMultiLineString);
            assertParseEwkt(testData.multiLineStringWithOneLineString);
            assertParseEwkt(testData.multiLineStringWithTwoLineStrings);

            assertParseEwkt(testData.emptyMultiPolygon);
            assertParseEwkt(testData.multiPolygonWithOnePolygon);
            assertParseEwkt(testData.multiPolygonWithTwoPolygons);

            assertParseEwkt(testData.emptyGeometryCollection);
            assertParseEwkt(testData.geometryCollectionWithPoint);
            assertParseEwkt(testData.geometryCollectionWithPointAndLineString);
            assertParseEwkt(testData.geometryCollectionWithPointAndLineStringAndPolygon);
        });
        it('parse(ewkb)', function () {
            assertParseEwkb(testData.point);

            assertParseEwkb(testData.emptyLineString);
            assertParseEwkb(testData.lineString);

            assertParseEwkb(testData.emptyPolygon);
            assertParseEwkb(testData.polygon);
            assertParseEwkb(testData.polygonWithOneInteriorRing);
            assertParseEwkb(testData.polygonWithTwoInteriorRings);

            assertParseEwkb(testData.emptyMultiPoint);
            assertParseEwkb(testData.multiPointWithOnePoint);
            assertParseEwkb(testData.multiPointWithTwoPoints);

            assertParseEwkb(testData.emptyMultiLineString);
            assertParseEwkb(testData.multiLineStringWithOneLineString);
            assertParseEwkb(testData.multiLineStringWithTwoLineStrings);

            assertParseEwkb(testData.emptyMultiPolygon);
            assertParseEwkb(testData.multiPolygonWithOnePolygon);
            assertParseEwkb(testData.multiPolygonWithTwoPolygons);

            assertParseEwkb(testData.emptyGeometryCollection);
            assertParseEwkb(testData.geometryCollectionWithPoint);
            assertParseEwkb(testData.geometryCollectionWithPointAndLineString);
            assertParseEwkb(testData.geometryCollectionWithPointAndLineStringAndPolygon);
        });
        it('parse(wkb) - big endian', function () {
            assertParseWkb(testData.pointBigEndian);
        });
        it('parse(ewkb) - big endian', function () {
            assertParseEwkb(testData.pointBigEndian);
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
	describe('Point', function () {
		it('toWkt()', function () {
            assertToWkt(testData.emptyPoint);
            assertToWkt(testData.point);
		});
        it('toWkb()', function () {
            assertToWkb(testData.emptyPoint);
            assertToWkb(testData.point);
		});
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyPoint);
            assertToEwkt(testData.point);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyPoint);
            assertToEwkb(testData.point);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyLineString);
            assertToEwkt(testData.lineString);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyLineString);
            assertToEwkb(testData.lineString);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyPolygon);
            assertToEwkt(testData.polygon);
            assertToEwkt(testData.polygonWithOneInteriorRing);
            assertToEwkt(testData.polygonWithTwoInteriorRings);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyPolygon);
            assertToEwkb(testData.polygon);
            assertToEwkb(testData.polygonWithOneInteriorRing);
            assertToEwkb(testData.polygonWithTwoInteriorRings);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyMultiPoint);
            assertToEwkt(testData.multiPointWithOnePoint);
            assertToEwkt(testData.multiPointWithTwoPoints);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyMultiPoint);
            assertToEwkb(testData.multiPointWithOnePoint);
            assertToEwkb(testData.multiPointWithTwoPoints);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyMultiLineString);
            assertToEwkt(testData.multiLineStringWithOneLineString);
            assertToEwkt(testData.multiLineStringWithTwoLineStrings);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyMultiLineString);
            assertToEwkb(testData.multiLineStringWithOneLineString);
            assertToEwkb(testData.multiLineStringWithTwoLineStrings);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyMultiPolygon);
            assertToEwkt(testData.multiPolygonWithOnePolygon);
            assertToEwkt(testData.multiPolygonWithTwoPolygons);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyMultiPolygon);
            assertToEwkb(testData.multiPolygonWithOnePolygon);
            assertToEwkb(testData.multiPolygonWithTwoPolygons);
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
        it('toEwkt()', function () {
            assertToEwkt(testData.emptyGeometryCollection);
            assertToEwkt(testData.geometryCollectionWithPoint);
            assertToEwkt(testData.geometryCollectionWithPointAndLineString);
            assertToEwkt(testData.geometryCollectionWithPointAndLineStringAndPolygon);
		});
        it('toEwkb()', function () {
            assertToEwkb(testData.emptyGeometryCollection);
            assertToEwkb(testData.geometryCollectionWithPoint);
            assertToEwkb(testData.geometryCollectionWithPointAndLineString);
            assertToEwkb(testData.geometryCollectionWithPointAndLineStringAndPolygon);
		});
	});
});