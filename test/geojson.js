var Geometry = require('../lib/geometry');
var Point = require('../lib/point');

var assert = require('assert');

describe('wkx', function () {
    describe('parseGeoJSON', function () {
        it('includes short CRS', function () {
            var point = new Point(1, 2);
            point.srid = 4326;

            assert.deepEqual(Geometry.parseGeoJSON({
                type: 'Point',
                crs: {
                    type: 'name',
                    properties: {
                        name: 'EPSG:4326'
                    }
                },
                coordinates: [1, 2]
            }), point);
        });
        it('includes long CRS', function () {
            var point = new Point(1, 2);
            point.srid = 4326;

            assert.deepEqual(Geometry.parseGeoJSON({
                type: 'Point',
                crs: {
                    type: 'name',
                    properties: {
                        name: 'urn:ogc:def:crs:EPSG::4326'
                    }
                },
                coordinates: [1, 2]
            }), point);
        });
    });
});
