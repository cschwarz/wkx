var Geometry = require('../geometry');
var Point = require('../point');
var LineString = require('../linestring');
var Polygon = require('../polygon');
var GeometryCollection = require('../geometrycollection');

var assert = require('assert');

describe('wkx', function () {
    describe('Geometry', function () {
        it('parse()', function () {
            //assert.deepEqual(Geometry.parse(new Buffer('010400000000000000', 'hex')), new Point());
            assert.deepEqual(Geometry.parse(new Buffer('0101000000000000000000f03f0000000000000040', 'hex')), new Point(1, 2));

            assert.deepEqual(Geometry.parse(new Buffer('010200000000000000', 'hex')), new LineString());
            assert.deepEqual(Geometry.parse(new Buffer('010200000002000000000000000000f03f000000000000004000000000000008400000000000001040', 'hex')),
                new LineString([new Point(1, 2), new Point(3, 4)]));

            assert.deepEqual(Geometry.parse(new Buffer('010300000000000000', 'hex')), new Polygon());
            assert.deepEqual(Geometry.parse(new Buffer(
                '01030000000100000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040', 'hex')),
                new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)]));
            assert.deepEqual(Geometry.parse(new Buffer(
                '01030000000200000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
                '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
                '40000000000000304000000000000026400000000000002840', 'hex')),
                new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)]]));
            assert.deepEqual(Geometry.parse(new Buffer(
                '01030000000300000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
                '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
                '40000000000000304000000000000026400000000000002840040000000000000000003540000000' +
                '00000036400000000000003740000000000000384000000000000039400000000000003a40000000' +
                '00000035400000000000003640', 'hex')),
                new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]]));

            assert.deepEqual(Geometry.parse(new Buffer('010700000000000000', 'hex')), new GeometryCollection());
            assert.deepEqual(Geometry.parse(new Buffer('0107000000010000000101000000000000000000f03f0000000000000040', 'hex')),
                new GeometryCollection([new Point(1, 2)]));
            assert.deepEqual(Geometry.parse(new Buffer('0107000000020000000101000000000000000000f03f000000000000004001020000000200000000' +
                '0000000000f03f000000000000004000000000000008400000000000001040', 'hex')),
                new GeometryCollection([new Point(1, 2), new LineString([new Point(1, 2), new Point(3, 4)])]));
            assert.deepEqual(Geometry.parse(new Buffer(
                '0107000000030000000101000000000000000000f03f000000000000004001020000000200000000' +
                '0000000000f03f000000000000004000000000000008400000000000001040010300000003000000' +
                '04000000000000000000f03f00000000000000400000000000000840000000000000104000000000' +
                '000014400000000000001840000000000000f03f0000000000000040040000000000000000002640' +
                '00000000000028400000000000002a400000000000002c400000000000002e400000000000003040' +
                '00000000000026400000000000002840040000000000000000003540000000000000364000000000' +
                '00003740000000000000384000000000000039400000000000003a40000000000000354000000000' +
                '00003640', 'hex')),
                new GeometryCollection([
                    new Point(1, 2),
                    new LineString([new Point(1, 2), new Point(3, 4)]),
                    new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                        [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                        [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]])]));

        });
    });
	describe('Point', function () {
		it('toWkt()', function () {
            assert.equal(new Point().toWkt(), 'POINT EMPTY');
			assert.equal(new Point(1, 2).toWkt(), 'POINT(1 2)');
		});
        it('toWkb()', function () {
            assert.equal(new Point().toWkb().toString('hex'), '010400000000000000');
			assert.equal(new Point(1, 2).toWkb().toString('hex'), '0101000000000000000000f03f0000000000000040');
		});
	});
    describe('LineString', function () {
		it('toWkt()', function () {
            assert.equal(new LineString().toWkt(), 'LINESTRING EMPTY');
			assert.equal(new LineString([new Point(1, 2), new Point(3, 4)]).toWkt(), 'LINESTRING(1 2,3 4)');
		});
        it('toWkb()', function () {
            assert.equal(new LineString().toWkb().toString('hex'), '010200000000000000');
			assert.equal(new LineString([new Point(1, 2), new Point(3, 4)]).toWkb().toString('hex'),
                '010200000002000000000000000000f03f000000000000004000000000000008400000000000001040');
		});
	});
    describe('Polygon', function () {
		it('toWkt()', function () {
            assert.equal(new Polygon().toWkt(), 'POLYGON EMPTY');
			assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)]).toWkt(), 'POLYGON((1 2,3 4,5 6,1 2))');
            assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)]]).toWkt(),
                'POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12))');
            assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]]).toWkt(),
                'POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12),(21 22,23 24,25 26,21 22))');
		});
        it('toWkb()', function () {
            assert.equal(new Polygon().toWkb().toString('hex'), '010300000000000000');
			assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)]).toWkb().toString('hex'),
                '01030000000100000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040');
            assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)]]).toWkb().toString('hex'),
                '01030000000200000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
                '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
                '40000000000000304000000000000026400000000000002840');
            assert.equal(new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]]).toWkb().toString('hex'),
                '01030000000300000004000000000000000000f03f00000000000000400000000000000840000000' +
                '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
                '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
                '40000000000000304000000000000026400000000000002840040000000000000000003540000000' +
                '00000036400000000000003740000000000000384000000000000039400000000000003a40000000' +
                '00000035400000000000003640');
		});
	});
    describe('GeometryCollection', function () {
		it('toWkt()', function () {
            assert.equal(new GeometryCollection().toWkt(), 'GEOMETRYCOLLECTION EMPTY');
			assert.equal(new GeometryCollection([new Point(1, 2)]).toWkt(), 'GEOMETRYCOLLECTION(POINT(1 2))');
            assert.equal(new GeometryCollection([new Point(1, 2), new LineString([new Point(1, 2), new Point(3, 4)])]).toWkt(),
                'GEOMETRYCOLLECTION(POINT(1 2),LINESTRING(1 2,3 4))');
            assert.equal(new GeometryCollection([
                new Point(1, 2),
                new LineString([new Point(1, 2), new Point(3, 4)]),
                new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                    [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                    [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]])]).toWkt(),
                'GEOMETRYCOLLECTION(POINT(1 2),LINESTRING(1 2,3 4),POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12),(21 22,23 24,25 26,21 22)))');
		});
        it('toWkb()', function () {
            assert.equal(new GeometryCollection().toWkb().toString('hex'), '010700000000000000');
			assert.equal(new GeometryCollection([new Point(1, 2)]).toWkb().toString('hex'),
                '0107000000010000000101000000000000000000f03f0000000000000040');
            assert.equal(new GeometryCollection([new Point(1, 2), new LineString([new Point(1, 2), new Point(3, 4)])]).toWkb().toString('hex'),
                '0107000000020000000101000000000000000000f03f000000000000004001020000000200000000' +
                '0000000000f03f000000000000004000000000000008400000000000001040');
            assert.equal(new GeometryCollection([
                new Point(1, 2),
                new LineString([new Point(1, 2), new Point(3, 4)]),
                new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                    [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                    [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]])]).toWkb().toString('hex'),
                '0107000000030000000101000000000000000000f03f000000000000004001020000000200000000' +
                '0000000000f03f000000000000004000000000000008400000000000001040010300000003000000' +
                '04000000000000000000f03f00000000000000400000000000000840000000000000104000000000' +
                '000014400000000000001840000000000000f03f0000000000000040040000000000000000002640' +
                '00000000000028400000000000002a400000000000002c400000000000002e400000000000003040' +
                '00000000000026400000000000002840040000000000000000003540000000000000364000000000' +
                '00003740000000000000384000000000000039400000000000003a40000000000000354000000000' +
                '00003640');
		});
	});
});