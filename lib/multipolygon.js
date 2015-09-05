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

MultiPolygon.Z = function (polygons) {
    var multiPolygon = new MultiPolygon(polygons);
    multiPolygon.hasZ = true;
    return multiPolygon;
};

MultiPolygon.M = function (polygons) {
    var multiPolygon = new MultiPolygon(polygons);
    multiPolygon.hasM = true;
    return multiPolygon;
};

MultiPolygon.ZM = function (polygons) {
    var multiPolygon = new MultiPolygon(polygons);
    multiPolygon.hasZ = true;
    multiPolygon.hasM = true;
    return multiPolygon;
};

MultiPolygon._parseWkt = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;
    multiPolygon.hasZ = options.hasZ;
    multiPolygon.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return multiPolygon;

    value.expectGroupStart();

    do {
        value.expectGroupStart();

        var exteriorRing = [];
        var interiorRings = [];

        value.expectGroupStart();
        exteriorRing.push.apply(exteriorRing, value.matchCoordinates(options));
        value.expectGroupEnd();

        while (value.isMatch([','])) {
            value.expectGroupStart();
            interiorRings.push(value.matchCoordinates(options));
            value.expectGroupEnd();
        }

        multiPolygon.polygons.push(new Polygon(exteriorRing, interiorRings));

        value.expectGroupEnd();

    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiPolygon;
};

MultiPolygon._parseWkb = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;
    multiPolygon.hasZ = options.hasZ;
    multiPolygon.hasM = options.hasM;

    var polygonCount = value.readUInt32();

    for (var i = 0; i < polygonCount; i++)
        multiPolygon.polygons.push(Geometry.parse(value, options));

    return multiPolygon;
};

MultiPolygon._parseTwkb = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.hasZ = options.hasZ;
    multiPolygon.hasM = options.hasM;

    if (options.isEmpty)
        return multiPolygon;

    var previousPoint = new Point(0, 0, options.hasZ ? 0 : undefined, options.hasM ? 0 : undefined);
    var polygonCount = value.readVarInt();

    for (var i = 0; i < polygonCount; i++) {
        var polygon = new Polygon();
        polygon.hasZ = options.hasZ;
        polygon.hasM = options.hasM;

        var ringCount = value.readVarInt();
        var exteriorRingCount = value.readVarInt();

        for (var j = 0; j < exteriorRingCount; j++)
            polygon.exteriorRing.push(Point._readTwkbPoint(value, options, previousPoint));

        for (j = 1; j < ringCount; j++) {
            var interiorRing = [];

            var interiorRingCount = value.readVarInt();

            for (var k = 0; k < interiorRingCount; k++)
                interiorRing.push(Point._readTwkbPoint(value, options, previousPoint));

            polygon.interiorRings.push(interiorRing);
        }

        multiPolygon.polygons.push(polygon);
    }

    return multiPolygon;
};

MultiPolygon._parseGeoJSON = function (value) {
    var multiPolygon = new MultiPolygon();

    if (value.coordinates.length > 0 && value.coordinates[0].length > 0 && value.coordinates[0][0].length > 0)
        multiPolygon.hasZ = value.coordinates[0][0][0].length > 2;

    for (var i = 0; i < value.coordinates.length; i++)
        multiPolygon.polygons.push(Polygon._parseGeoJSON({ coordinates: value.coordinates[i] }));

    return multiPolygon;
};

MultiPolygon.prototype.toWkt = function () {
    if (this.polygons.length === 0)
        return this._getWktType(Types.wkt.MultiPolygon, true);

    var wkt = this._getWktType(Types.wkt.MultiPolygon, false) + '(';

    for (var i = 0; i < this.polygons.length; i++)
        wkt += this.polygons[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPolygon.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    this._writeWkbType(wkb, Types.wkb.MultiPolygon);
    wkb.writeUInt32LE(this.polygons.length);

    for (var i = 0; i < this.polygons.length; i++)
        wkb.writeBuffer(this.polygons[i].toWkb({ srid: this.srid }));

    return wkb.buffer;
};

MultiPolygon.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var zPrecision = 0;
    var zPrecisionFactor = Math.pow(10, zPrecision);
    var mPrecision = 0;
    var mPrecisionFactor = Math.pow(10, mPrecision);

    var isEmpty = this.polygons.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.MultiPolygon, precision, zPrecision, mPrecision, isEmpty);

    if (this.polygons.length > 0) {
        twkb.writeVarInt(this.polygons.length);

        var lastX = 0;
        var lastY = 0;
        var lastZ = 0;
        var lastM = 0;
        var x = 0;
        var y = 0;
        var z = 0;
        var m = 0;

        for (var i = 0; i < this.polygons.length; i++) {
            twkb.writeVarInt(1 + this.polygons[i].interiorRings.length);

            twkb.writeVarInt(this.polygons[i].exteriorRing.length);

            for (var j = 0; j < this.polygons[i].exteriorRing.length; j++) {
                x = this.polygons[i].exteriorRing[j].x * precisionFactor;
                y = this.polygons[i].exteriorRing[j].y * precisionFactor;
                z = this.polygons[i].exteriorRing[j].z * zPrecisionFactor;
                m = this.polygons[i].exteriorRing[j].m * mPrecisionFactor;

                twkb.writeVarInt(ZigZag.encode(x - lastX));
                twkb.writeVarInt(ZigZag.encode(y - lastY));
                if (this.hasZ)
                    twkb.writeVarInt(ZigZag.encode(z - lastZ));
                if (this.hasM)
                    twkb.writeVarInt(ZigZag.encode(m - lastM));

                lastX = x;
                lastY = y;
                lastZ = z;
                lastM = m;
            }

            for (j = 0; j < this.polygons[i].interiorRings.length; j++) {
                twkb.writeVarInt(this.polygons[i].interiorRings[j].length);

                for (var k = 0; k < this.polygons[i].interiorRings[j].length; k++) {
                    x = this.polygons[i].interiorRings[j][k].x * precisionFactor;
                    y = this.polygons[i].interiorRings[j][k].y * precisionFactor;
                    z = this.polygons[i].interiorRings[j][k].z * zPrecisionFactor;
                    m = this.polygons[i].interiorRings[j][k].m * mPrecisionFactor;

                    twkb.writeVarInt(ZigZag.encode(x - lastX));
                    twkb.writeVarInt(ZigZag.encode(y - lastY));
                    if (this.hasZ)
                        twkb.writeVarInt(ZigZag.encode(z - lastZ));
                    if (this.hasM)
                        twkb.writeVarInt(ZigZag.encode(m - lastM));

                    lastX = x;
                    lastY = y;
                    lastZ = z;
                    lastM = m;
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

MultiPolygon.prototype.toGeoJSON = function (options) {
    var geoJSON = Geometry.prototype.toGeoJSON.call(this, options);
    geoJSON.type = Types.geoJSON.MultiPolygon;
    geoJSON.coordinates = [];

    for (var i = 0; i < this.polygons.length; i++)
        geoJSON.coordinates.push(this.polygons[i].toGeoJSON().coordinates);

    return geoJSON;
};
