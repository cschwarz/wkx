module.exports = Polygon;

var util = require('util');

var Geometry = require('./geometry');
var Types = require('./types');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag');

function Polygon(exteriorRing, interiorRings) {
    Geometry.call(this);

    this.exteriorRing = exteriorRing || [];
    this.interiorRings = interiorRings || [];

    if (this.exteriorRing.length > 0) {
        this.hasZ = this.exteriorRing[0].hasZ;
        this.hasM = this.exteriorRing[0].hasM;
    }
}

util.inherits(Polygon, Geometry);

Polygon.Z = function (exteriorRing, interiorRings) {
    var polygon = new Polygon(exteriorRing, interiorRings);
    polygon.hasZ = true;
    return polygon;
};

Polygon.M = function (exteriorRing, interiorRings) {
    var polygon = new Polygon(exteriorRing, interiorRings);
    polygon.hasM = true;
    return polygon;
};

Polygon.ZM = function (exteriorRing, interiorRings) {
    var polygon = new Polygon(exteriorRing, interiorRings);
    polygon.hasZ = true;
    polygon.hasM = true;
    return polygon;
};

Polygon._parseWkt = function (value, options) {
    var polygon = new Polygon();
    polygon.srid = options.srid;
    polygon.hasZ = options.hasZ;
    polygon.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return polygon;

    value.expectGroupStart();

    value.expectGroupStart();
    polygon.exteriorRing.push.apply(polygon.exteriorRing, value.matchCoordinates(options));
    value.expectGroupEnd();

    while (value.isMatch([','])) {
        value.expectGroupStart();
        polygon.interiorRings.push(value.matchCoordinates(options));
        value.expectGroupEnd();
    }

    value.expectGroupEnd();

    return polygon;
};

Polygon._parseWkb = function (value, options) {
    var polygon = new Polygon();
    polygon.srid = options.srid;
    polygon.hasZ = options.hasZ;
    polygon.hasM = options.hasM;

    var ringCount = value.readUInt32();

    if (ringCount > 0) {
        var exteriorRingCount = value.readUInt32();

        for (var i = 0; i < exteriorRingCount; i++)
            polygon.exteriorRing.push(Point._readWkbPoint(value, options));

        for (i = 1; i < ringCount; i++) {
            var interiorRing = [];

            var interiorRingCount = value.readUInt32();

            for (var j = 0; j < interiorRingCount; j++)
                interiorRing.push(Point._readWkbPoint(value, options));

            polygon.interiorRings.push(interiorRing);
        }
    }

    return polygon;
};

Polygon._parseTwkb = function (value, options) {
    var polygon = new Polygon();
    polygon.hasZ = options.hasZ;
    polygon.hasM = options.hasM;

    if (options.isEmpty)
        return polygon;

    var previousPoint = new Point(0, 0, options.hasZ ? 0 : undefined, options.hasM ? 0 : undefined);
    var ringCount = value.readVarInt();
    var exteriorRingCount = value.readVarInt();

    for (var i = 0; i < exteriorRingCount; i++)
        polygon.exteriorRing.push(Point._readTwkbPoint(value, options, previousPoint));

    for (i = 1; i < ringCount; i++) {
        var interiorRing = [];

        var interiorRingCount = value.readVarInt();

        for (var j = 0; j < interiorRingCount; j++)
            interiorRing.push(Point._readTwkbPoint(value, options, previousPoint));

        polygon.interiorRings.push(interiorRing);
    }

    return polygon;
};

Polygon._parseGeoJSON = function (value) {
    var polygon = new Polygon();

    if (value.coordinates.length > 0 && value.coordinates[0].length > 0)
        polygon.hasZ = value.coordinates[0][0].length > 2;

    for (var i = 0; i < value.coordinates.length; i++) {
        if (i > 0)
            polygon.interiorRings.push([]);

        for (var j = 0; j  < value.coordinates[i].length; j++) {
            if (i === 0)
                polygon.exteriorRing.push(Point._readGeoJSONPoint(value.coordinates[i][j]));
            else
                polygon.interiorRings[i - 1].push(Point._readGeoJSONPoint(value.coordinates[i][j]));
        }
    }

    return polygon;
};

Polygon.prototype.toWkt = function () {
    if (this.exteriorRing.length === 0)
        return this._getWktType(Types.wkt.Polygon, true);

    return this._getWktType(Types.wkt.Polygon, false) + this._toInnerWkt();
};

Polygon.prototype._toInnerWkt = function () {
    var innerWkt = '((';

    for (var i = 0; i < this.exteriorRing.length; i++)
        innerWkt += this._getWktCoordinate(this.exteriorRing[i]) + ',';

    innerWkt = innerWkt.slice(0, -1);
    innerWkt += ')';

    for (i = 0; i < this.interiorRings.length; i++) {
        innerWkt += ',(';

        for (var j = 0; j < this.interiorRings[i].length; j++) {
            innerWkt += this._getWktCoordinate(this.interiorRings[i][j]) + ',';
        }

        innerWkt = innerWkt.slice(0, -1);
        innerWkt += ')';
    }

    innerWkt += ')';

    return innerWkt;
};

Polygon.prototype.toWkb = function (parentOptions) {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    this._writeWkbType(wkb, Types.wkb.Polygon, parentOptions);

    if (this.exteriorRing.length > 0) {
        wkb.writeUInt32LE(1 + this.interiorRings.length);
        wkb.writeUInt32LE(this.exteriorRing.length);
    }
    else {
        wkb.writeUInt32LE(0);
    }

    for (var i = 0; i < this.exteriorRing.length; i++)
        this.exteriorRing[i]._writeWkbPoint(wkb);

    for (i = 0; i < this.interiorRings.length; i++) {
        wkb.writeUInt32LE(this.interiorRings[i].length);

        for (var j = 0; j < this.interiorRings[i].length; j++)
            this.interiorRings[i][j]._writeWkbPoint(wkb);
    }

    return wkb.buffer;
};

Polygon.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var zPrecision = 0;
    var zPrecisionFactor = Math.pow(10, zPrecision);
    var mPrecision = 0;
    var mPrecisionFactor = Math.pow(10, mPrecision);

    var isEmpty = this.exteriorRing.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.Polygon, precision, zPrecision, mPrecision, isEmpty);

    if (this.exteriorRing.length > 0) {
        twkb.writeVarInt(1 + this.interiorRings.length);

        twkb.writeVarInt(this.exteriorRing.length);

        var lastX = 0;
        var lastY = 0;
        var lastZ = 0;
        var lastM = 0;
        var x = 0;
        var y = 0;
        var z = 0;
        var m = 0;

        for (var i = 0; i < this.exteriorRing.length; i++) {
            x = this.exteriorRing[i].x * precisionFactor;
            y = this.exteriorRing[i].y * precisionFactor;
            z = this.exteriorRing[i].z * zPrecisionFactor;
            m = this.exteriorRing[i].m * mPrecisionFactor;

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

        for (i = 0; i < this.interiorRings.length; i++) {
            twkb.writeVarInt(this.interiorRings[i].length);

            for (var j = 0; j < this.interiorRings[i].length; j++) {
                x = this.interiorRings[i][j].x * precisionFactor;
                y = this.interiorRings[i][j].y * precisionFactor;
                z = this.interiorRings[i][j].z * zPrecisionFactor;
                m = this.interiorRings[i][j].m * mPrecisionFactor;

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

    return twkb.buffer;
};

Polygon.prototype._getWkbSize = function () {
    var coordinateSize = 16;

    if (this.hasZ)
        coordinateSize += 8;
    if (this.hasM)
        coordinateSize += 8;

    var size = 1 + 4 + 4;

    if (this.exteriorRing.length > 0)
        size += 4 + (this.exteriorRing.length * coordinateSize);

    for (var i = 0; i < this.interiorRings.length; i++)
        size += 4 + (this.interiorRings[i].length * coordinateSize);

    return size;
};

Polygon.prototype.toGeoJSON = function (options) {
    var geoJSON = Geometry.prototype.toGeoJSON.call(this, options);
    geoJSON.type = Types.geoJSON.Polygon;
    geoJSON.coordinates = [];

    if (this.exteriorRing.length > 0) {
        var exteriorRing = [];

        for (var i = 0; i < this.exteriorRing.length; i++) {
            if (this.hasZ)
                exteriorRing.push([this.exteriorRing[i].x, this.exteriorRing[i].y, this.exteriorRing[i].z]);
            else
                exteriorRing.push([this.exteriorRing[i].x, this.exteriorRing[i].y]);
        }

        geoJSON.coordinates.push(exteriorRing);
    }

    for (var j = 0; j < this.interiorRings.length; j++) {
        var interiorRing = [];

        for (var k = 0; k < this.interiorRings[j].length; k++) {
            if (this.hasZ)
                interiorRing.push([this.interiorRings[j][k].x, this.interiorRings[j][k].y, this.interiorRings[j][k].z]);
            else
                interiorRing.push([this.interiorRings[j][k].x, this.interiorRings[j][k].y]);
        }

        geoJSON.coordinates.push(interiorRing);
    }

    return geoJSON;
};
