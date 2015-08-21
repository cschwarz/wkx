module.exports = Point;

var util = require('util');

var Geometry = require('./geometry');
var Types = require('./types');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag.js');

function Point(x, y, z, m) {
    Geometry.call(this);

    this.x = x;
    this.y = y;
    this.z = z;
    this.m = m;

    this.hasZ = typeof this.z !== 'undefined';
    this.hasM = typeof this.m !== 'undefined';
}

util.inherits(Point, Geometry);

Point.Z = function (x, y, z) {
    var point = new Point(x, y, z);
    point.hasZ = true;
    return point;
};

Point.M = function (x, y, m) {
    var point = new Point(x, y, undefined, m);
    point.hasM = true;
    return point;
};

Point.ZM = function (x, y, z, m) {
    var point = new Point(x, y, z, m);
    point.hasZ = true;
    point.hasM = true;
    return point;
};

Point._parseWkt = function (value, options) {
    var point = new Point();
    point.srid = options.srid;
    point.hasZ = options.hasZ;
    point.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return point;

    value.expectGroupStart();

    var coordinate = value.matchCoordinate(options);

    point.x = coordinate.x;
    point.y = coordinate.y;
    point.z = coordinate.z;
    point.m = coordinate.m;

    value.expectGroupEnd();

    return point;
};

Point._parseWkb = function (value, options) {
    var point = new Point(value.readDouble(), value.readDouble());
    point.srid = options.srid;
    return point;
};

Point._parseTwkb = function (value, options) {
    var point = new Point();
    point.hasZ = options.hasZ;
    point.hasM = options.hasM;
    
    if (options.isEmpty)
        return point;

    point.x = ZigZag.decode(value.readVarInt()) / options.precisionFactor;
    point.y = ZigZag.decode(value.readVarInt()) / options.precisionFactor;
    point.z = options.hasZ ? ZigZag.decode(value.readVarInt()) / options.zPrecisionFactor : undefined;
    point.m = options.hasM ? ZigZag.decode(value.readVarInt()) / options.mPrecisionFactor : undefined;

    return point;
};

Point._parseGeoJSON = function (value) {
    if (value.coordinates.length === 0)
        return new Point();

    if (value.coordinates.length > 2)
        return new Point(value.coordinates[0], value.coordinates[1], value.coordinates[2]);

    return new Point(value.coordinates[0], value.coordinates[1]);
};

Point.prototype.toWkt = function () {
    if (typeof this.x === 'undefined' && typeof this.y === 'undefined' &&
        typeof this.z === 'undefined' && typeof this.m === 'undefined')
        return this._getWktType(Types.wkt.Point, true);

    return this._getWktType(Types.wkt.Point, false) + '(' + this._getWktCoordinate(this) + ')';
};

Point.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    if (typeof this.x === 'undefined' && typeof this.y === 'undefined') {
        wkb.writeUInt32LE(Types.wkb.MultiPoint);
        wkb.writeUInt32LE(0);
    }
    else {
        wkb.writeUInt32LE(Types.wkb.Point);
        wkb.writeDoubleLE(this.x);
        wkb.writeDoubleLE(this.y);
    }

    return wkb.buffer;
};

Point.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var zPrecision = 0;
    var zPrecisionFactor = Math.pow(10, zPrecision);
    var mPrecision = 0;
    var mPrecisionFactor = Math.pow(10, mPrecision);
    var isEmpty = typeof this.x === 'undefined' && typeof this.y === 'undefined';

    this._writeTwkbHeader(twkb, Types.wkb.Point, precision, zPrecision, mPrecision, isEmpty);

    if (!isEmpty) {
        twkb.writeVarInt(ZigZag.encode(this.x * precisionFactor));
        twkb.writeVarInt(ZigZag.encode(this.y * precisionFactor));
        if (this.hasZ)
            twkb.writeVarInt(ZigZag.encode(this.z * zPrecisionFactor));
        if (this.hasM)
            twkb.writeVarInt(ZigZag.encode(this.m * mPrecisionFactor));
    }

    return twkb.buffer;
};

Point.prototype._getWkbSize = function () {
    if (typeof this.x === 'undefined' && typeof this.y === 'undefined')
        return 1 + 4 + 4;

    return 1 + 4 + 8 + 8;
};

Point.prototype.toGeoJSON = function (options) {
    var geoJSON = Geometry.prototype.toGeoJSON.call(this, options);
    geoJSON.type = Types.geoJSON.Point;

    if (typeof this.x === 'undefined' && typeof this.y === 'undefined')
        geoJSON.coordinates = [];
    else if (typeof this.z !== 'undefined')
        geoJSON.coordinates = [this.x, this.y, this.z];
    else
        geoJSON.coordinates = [this.x, this.y];

    return geoJSON;
};
