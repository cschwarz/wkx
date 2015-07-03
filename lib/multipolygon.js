module.exports = MultiPolygon;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var Point = require('./point');
var Polygon = require('./polygon');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag.js');

function MultiPolygon(polygons) {
    Geometry.call(this);

    this.polygons = polygons || [];
}

util.inherits(MultiPolygon, Geometry);

MultiPolygon._parseWkt = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return multiPolygon;

    value.expectGroupStart();

    do {
        value.expectGroupStart();

        var polygon = new Polygon();

        value.expectGroupStart();
        polygon.exteriorRing.push.apply(polygon.exteriorRing, value.matchCoordinates());
        value.expectGroupEnd();

        while (value.isMatch([','])) {
            value.expectGroupStart();
            polygon.interiorRings.push(value.matchCoordinates());
            value.expectGroupEnd();
        }

        multiPolygon.polygons.push(polygon);

        value.expectGroupEnd();

    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiPolygon;
};

MultiPolygon._parseWkb = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;

    var polygonCount = value.readUInt32();

    for (var i = 0; i < polygonCount; i++)
        multiPolygon.polygons.push(Geometry.parse(value));

    return multiPolygon;
};

MultiPolygon._parseTwkb = function (value, options) {
    var multiPolygon = new MultiPolygon();

    if (options.isEmpty)
        return multiPolygon;

    var x = 0;
    var y = 0;
    var polygonCount = value.readVarInt();

    for (var i = 0; i < polygonCount; i++) {
        var polygon = new Polygon();
        var ringCount = value.readVarInt();
        var exteriorRingCount = value.readVarInt();

        for (var j = 0; j < exteriorRingCount; j++) {
            x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
            y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

            polygon.exteriorRing.push(new Point(x, y));
        }

        for (j = 1; j < ringCount; j++) {
            var interiorRing = [];

            var interiorRingCount = value.readVarInt();

            for (var k = 0; k < interiorRingCount; k++) {
                x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
                y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

                interiorRing.push(new Point(x, y));
            }

            polygon.interiorRings.push(interiorRing);
        }

        multiPolygon.polygons.push(polygon);
    }

    return multiPolygon;
};

MultiPolygon._parseGeoJSON = function (value) {
    var multiPolygon = new MultiPolygon();

    for (var i = 0; i < value.coordinates.length; i++)
        multiPolygon.polygons.push(Polygon._parseGeoJSON({ coordinates: value.coordinates[i] }));

    return multiPolygon;
};

MultiPolygon.prototype.toWkt = function () {
    if (this.polygons.length === 0)
        return Types.wkt.MultiPolygon + ' EMPTY';

    var wkt = Types.wkt.MultiPolygon + '(';

    for (var i = 0; i < this.polygons.length; i++)
        wkt += this.polygons[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPolygon.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.MultiPolygon);
    wkb.writeUInt32LE(this.polygons.length);

    for (var i = 0; i < this.polygons.length; i++)
        wkb.writeBuffer(this.polygons[i].toWkb());

    return wkb.buffer;
};

MultiPolygon.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var isEmpty = this.polygons.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.MultiPolygon, precision, isEmpty);

    if (this.polygons.length > 0) {
        twkb.writeVarInt(this.polygons.length);

        var lastX = 0;
        var lastY = 0;
        var x = 0;
        var y = 0;

        for (var i = 0; i < this.polygons.length; i++) {
            twkb.writeVarInt(1 + this.polygons[i].interiorRings.length);

            twkb.writeVarInt(this.polygons[i].exteriorRing.length);

            for (var j = 0; j < this.polygons[i].exteriorRing.length; j++) {
                x = this.polygons[i].exteriorRing[j].x * precisionFactor;
                y = this.polygons[i].exteriorRing[j].y * precisionFactor;

                twkb.writeVarInt(ZigZag.encode(x - lastX));
                twkb.writeVarInt(ZigZag.encode(y - lastY));

                lastX = x;
                lastY = y;
            }

            for (j = 0; j < this.polygons[i].interiorRings.length; j++) {
                twkb.writeVarInt(this.polygons[i].interiorRings[j].length);

                for (var k = 0; k < this.polygons[i].interiorRings[j].length; k++) {
                    x = this.polygons[i].interiorRings[j][k].x * precisionFactor;
                    y = this.polygons[i].interiorRings[j][k].y * precisionFactor;

                    twkb.writeVarInt(ZigZag.encode(x - lastX));
                    twkb.writeVarInt(ZigZag.encode(y - lastY));

                    lastX = x;
                    lastY = y;
                }
            }
        }
    }

    return twkb.buffer;
};

MultiPolygon.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.polygons.length; i++)
        size += this.polygons[i]._getWkbSize();

    return size;
};

MultiPolygon.prototype.toGeoJSON = function () {
    var geoJSON = {
        type: Types.geoJSON.MultiPolygon,
        coordinates: []
    };

    for (var i = 0; i < this.polygons.length; i++)
        geoJSON.coordinates.push(this.polygons[i].toGeoJSON().coordinates);

    return geoJSON;
};
