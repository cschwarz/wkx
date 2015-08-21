module.exports = LineString;

var util = require('util');

var Geometry = require('./geometry');
var Types = require('./types');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag.js');

function LineString(points) {
    Geometry.call(this);

    this.points = points || [];
}

util.inherits(LineString, Geometry);

LineString.Z = function (points) {
    var lineString = new LineString(points);
    lineString.hasZ = true;
    return lineString;
};

LineString.M = function (points) {
    var lineString = new LineString(points);
    lineString.hasM = true;
    return lineString;
};

LineString.ZM = function (points) {
    var lineString = new LineString(points);
    lineString.hasZ = true;
    lineString.hasM = true;
    return lineString;
};

LineString._parseWkt = function (value, options) {
    var lineString = new LineString();
    lineString.srid = options.srid;
    lineString.hasZ = options.hasZ;
    lineString.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return lineString;

    value.expectGroupStart();
    lineString.points.push.apply(lineString.points, value.matchCoordinates(options));
    value.expectGroupEnd();

    return lineString;
};

LineString._parseWkb = function (value, options) {
    var lineString = new LineString();
    lineString.srid = options.srid;

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        lineString.points.push(new Point(value.readDouble(), value.readDouble()));

    return lineString;
};

LineString._parseTwkb = function (value, options) {
    var lineString = new LineString();
    lineString.hasZ = options.hasZ;
    lineString.hasM = options.hasM;

    if (options.isEmpty)
        return lineString;

    var x = 0;
    var y = 0;
    var z = options.hasZ ? 0 : undefined;
    var m = options.hasM ? 0 : undefined;
    var pointCount = value.readVarInt();

    for (var i = 0; i < pointCount; i++) {
        x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
        y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
        
        if (options.hasZ)
            z += ZigZag.decode(value.readVarInt()) / options.zPrecisionFactor;
        if (options.hasM)
            m += ZigZag.decode(value.readVarInt()) / options.mPrecisionFactor;

        lineString.points.push(new Point(x, y, z, m));
    }

    return lineString;
};

LineString._parseGeoJSON = function (value) {
    var lineString = new LineString();
    
    if (value.coordinates.length > 0)
        lineString.hasZ = value.coordinates[0].length > 2;

    for (var i = 0; i < value.coordinates.length; i++) {
        if (value.coordinates[i].length > 2) {
            lineString.points.push(new Point(value.coordinates[i][0],
                                             value.coordinates[i][1], 
                                             value.coordinates[i][2]));
        }
        else {
            lineString.points.push(new Point(value.coordinates[i][0], 
                                             value.coordinates[i][1]));
        }
    }

    return lineString;
};

LineString.prototype.toWkt = function () {
    if (this.points.length === 0)
    return this._getWktType(Types.wkt.LineString, true);

    return this._getWktType(Types.wkt.LineString, false) + this._toInnerWkt();
};

LineString.prototype._toInnerWkt = function () {
    var innerWkt = '(';

    for (var i = 0; i < this.points.length; i++)
        innerWkt += this._getWktCoordinate(this.points[i]) + ',';

    innerWkt = innerWkt.slice(0, -1);
    innerWkt += ')';

    return innerWkt;
};

LineString.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.LineString);
    wkb.writeUInt32LE(this.points.length);

    for (var i = 0; i < this.points.length; i++) {
        wkb.writeDoubleLE(this.points[i].x);
        wkb.writeDoubleLE(this.points[i].y);
    }

    return wkb.buffer;
};

LineString.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var zPrecision = 0;
    var zPrecisionFactor = Math.pow(10, zPrecision);
    var mPrecision = 0;
    var mPrecisionFactor = Math.pow(10, mPrecision);
    var isEmpty = this.points.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.LineString, precision, zPrecision, mPrecision, isEmpty);

    if (this.points.length > 0) {
        twkb.writeVarInt(this.points.length);

        var lastX = 0;
        var lastY = 0;
        var lastZ = 0;
        var lastM = 0;
        for (var i = 0; i < this.points.length; i++) {
            var x = this.points[i].x * precisionFactor;
            var y = this.points[i].y * precisionFactor;
            var z = this.points[i].z * zPrecisionFactor;
            var m = this.points[i].m * mPrecisionFactor;

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

    return twkb.buffer;
};

LineString.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 16);
};

LineString.prototype.toGeoJSON = function (options) {
    var geoJSON = Geometry.prototype.toGeoJSON.call(this, options);
    geoJSON.type = Types.geoJSON.LineString;
    geoJSON.coordinates = [];

    for (var i = 0; i < this.points.length; i++) {
        if (this.hasZ)
            geoJSON.coordinates.push([this.points[i].x, this.points[i].y, this.points[i].z]);
        else
            geoJSON.coordinates.push([this.points[i].x, this.points[i].y]);
    }

    return geoJSON;
};
