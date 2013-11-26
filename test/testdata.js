var Point = require('../point');
var LineString = require('../linestring');
var Polygon = require('../polygon');
var MultiPoint = require('../multipoint');
var MultiLineString = require('../multilinestring');
var MultiPolygon = require('../multipolygon');
var GeometryCollection = require('../geometrycollection');

module.exports = {
    emptyPoint: {
        geometry: new Point(),
        wkt: 'POINT EMPTY',
        wkb: '010400000000000000'
    },
    point: {
        geometry: new Point(1, 2),
        wkt: 'POINT(1 2)',
        wkb: '0101000000000000000000f03f0000000000000040'
    },
    emptyLineString: {
        geometry: new LineString(),
        wkt: 'LINESTRING EMPTY',
        wkb: '010200000000000000'
    },
    lineString: {
        geometry: new LineString([new Point(1, 2), new Point(3, 4)]),
        wkt: 'LINESTRING(1 2,3 4)',
        wkb: '010200000002000000000000000000f03f000000000000004000000000000008400000000000001040'
    },
    emptyPolygon: {
        geometry: new Polygon(),
        wkt: 'POLYGON EMPTY',
        wkb: '010300000000000000'
    },
    polygon: {
        geometry: new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)]),
        wkt: 'POLYGON((1 2,3 4,5 6,1 2))',
        wkb: '01030000000100000004000000000000000000f03f00000000000000400000000000000840000000' +
             '000000104000000000000014400000000000001840000000000000f03f0000000000000040'
    },
    polygonWithOneInteriorRing: {
        geometry: new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
            [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)]]),
        wkt: 'POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12))',
        wkb: '01030000000200000004000000000000000000f03f00000000000000400000000000000840000000' +
             '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
             '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
             '40000000000000304000000000000026400000000000002840'
    },
    polygonWithTwoInteriorRings: {
        geometry: new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
            [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
            [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]]),
        wkt: 'POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12),(21 22,23 24,25 26,21 22))',
        wkb: '01030000000300000004000000000000000000f03f00000000000000400000000000000840000000' +
             '000000104000000000000014400000000000001840000000000000f03f0000000000000040040000' +
             '00000000000000264000000000000028400000000000002a400000000000002c400000000000002e' +
             '40000000000000304000000000000026400000000000002840040000000000000000003540000000' +
             '00000036400000000000003740000000000000384000000000000039400000000000003a40000000' +
             '00000035400000000000003640'
    },
    emptyMultiPoint: {
        geometry: new MultiPoint(),
        wkt: 'MULTIPOINT EMPTY',
        wkb: '010400000000000000'
    },
    multiPointWithOnePoint: {
        geometry: new MultiPoint([new Point(1, 2)]),
        wkt: 'MULTIPOINT(1 2)',
        wkb: '0104000000010000000101000000000000000000f03f0000000000000040'
    },
    multiPointWithTwoPoints: {
        geometry: new MultiPoint([new Point(1, 2), new Point(3, 4)]),
        wkt: 'MULTIPOINT(1 2,3 4)',
        wkb: '0104000000020000000101000000000000000000f03f000000000000004001010000000000000000' +
             '0008400000000000001040'
    },
    emptyMultiLineString: {
        geometry: new MultiLineString(),
        wkt: 'MULTILINESTRING EMPTY',
        wkb: '010500000000000000'
    },
    multiLineStringWithOneLineString: {
        geometry: new MultiLineString([new LineString([new Point(1, 2), new Point(3, 4)])]),
        wkt: 'MULTILINESTRING((1 2,3 4))',
        wkb: '010500000001000000010200000002000000000000000000f03f0000000000000040000000000000' +
             '08400000000000001040'
    },
    multiLineStringWithTwoLineStrings: {
        geometry: new MultiLineString([new LineString([new Point(1, 2), new Point(3, 4)]), new LineString([new Point(5, 6), new Point(7, 8)])]),
        wkt: 'MULTILINESTRING((1 2,3 4),(5 6,7 8))',
        wkb: '010500000002000000010200000002000000000000000000f03f0000000000000040000000000000' +
             '08400000000000001040010200000002000000000000000000144000000000000018400000000000' +
             '001c400000000000002040'
    },
    emptyMultiPolygon: {
        geometry: new MultiPolygon(),
        wkt: 'MULTIPOLYGON EMPTY',
        wkb: '010600000000000000'
    },
    multiPolygonWithOnePolygon: {
        geometry: new MultiPolygon([new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)])]),
        wkt: 'MULTIPOLYGON(((1 2,3 4,5 6,1 2)))',
        wkb: '01060000000100000001030000000100000004000000000000000000f03f00000000000000400000' +
             '000000000840000000000000104000000000000014400000000000001840000000000000f03f0000' +
             '000000000040'
    },
    multiPolygonWithTwoPolygons: {
        geometry: new MultiPolygon([new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)]),
                  new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                    [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                    [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]])]),
        wkt: 'MULTIPOLYGON(((1 2,3 4,5 6,1 2)),((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12),(21 22,23 24,25 26,21 22)))',
        wkb: '01060000000200000001030000000100000004000000000000000000f03f00000000000000400000' +
             '000000000840000000000000104000000000000014400000000000001840000000000000f03f0000' +
             '00000000004001030000000300000004000000000000000000f03f00000000000000400000000000' +
             '000840000000000000104000000000000014400000000000001840000000000000f03f0000000000' +
             '00004004000000000000000000264000000000000028400000000000002a400000000000002c4000' +
             '00000000002e40000000000000304000000000000026400000000000002840040000000000000000' +
             '00354000000000000036400000000000003740000000000000384000000000000039400000000000' +
             '003a4000000000000035400000000000003640'
    },
    emptyGeometryCollection: {
        geometry: new GeometryCollection(),
        wkt: 'GEOMETRYCOLLECTION EMPTY',
        wkb: '010700000000000000'
    },
    geometryCollectionWithPoint: {
        geometry: new GeometryCollection([new Point(1, 2)]),
        wkt: 'GEOMETRYCOLLECTION(POINT(1 2))',
        wkb: '0107000000010000000101000000000000000000f03f0000000000000040'
    },
    geometryCollectionWithPointAndLineString: {
        geometry: new GeometryCollection([new Point(1, 2), new LineString([new Point(1, 2), new Point(3, 4)])]),
        wkt: 'GEOMETRYCOLLECTION(POINT(1 2),LINESTRING(1 2,3 4))',
        wkb: '0107000000020000000101000000000000000000f03f000000000000004001020000000200000000' +
             '0000000000f03f000000000000004000000000000008400000000000001040'
    },
    geometryCollectionWithPointAndLineStringAndPolygon: {
        geometry: new GeometryCollection([
                  new Point(1, 2),
                  new LineString([new Point(1, 2), new Point(3, 4)]),
                  new Polygon([new Point(1, 2), new Point(3, 4), new Point(5, 6), new Point(1, 2)], [
                    [new Point(11, 12), new Point(13, 14), new Point(15, 16), new Point(11, 12)],
                    [new Point(21, 22), new Point(23, 24), new Point(25, 26), new Point(21, 22)]])]),
        wkt: 'GEOMETRYCOLLECTION(POINT(1 2),LINESTRING(1 2,3 4),POLYGON((1 2,3 4,5 6,1 2),(11 12,13 14,15 16,11 12),(21 22,23 24,25 26,21 22)))',
        wkb: '0107000000030000000101000000000000000000f03f000000000000004001020000000200000000' +
             '0000000000f03f000000000000004000000000000008400000000000001040010300000003000000' +
             '04000000000000000000f03f00000000000000400000000000000840000000000000104000000000' +
             '000014400000000000001840000000000000f03f0000000000000040040000000000000000002640' +
             '00000000000028400000000000002a400000000000002c400000000000002e400000000000003040' +
             '00000000000026400000000000002840040000000000000000003540000000000000364000000000' +
             '00003740000000000000384000000000000039400000000000003a40000000000000354000000000' +
             '00003640'
    }
};