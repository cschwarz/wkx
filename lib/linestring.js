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

LineString._parseWkt = function (value, options) {
    var lineString = new LineString();
    lineString.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return lineString;

    value.expectGroupStart();
    lineString.points.push.apply(lineString.points, value.matchCoordinates());
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

    if (options.isEmpty)
        return lineString;

    var x = 0;
    var y = 0;
    var pointCount = value.readVarInt();

    for (var i = 0; i < pointCount; i++) {
        x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
        y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

        lineString.points.push(new Point(x, y));
    }

    return lineString;
};

LineString._parseGeoJSON = function (value) {
    var lineString = new LineString();

    for (var i = 0; i < value.coordinates.length; i++)
        lineString.points.push(new Point(value.coordinates[i][0], value.coordinates[i][1]));

    return lineString;
};

LineString.prototype.toWkt = function () {
    if (this.points.length === 0)
        return Types.wkt.LineString + ' EMPTY';

    return Types.wkt.LineString + this._toInnerWkt();
};

LineString.prototype._toInnerWkt = function () {
    var innerWkt = '(';

    for (var i = 0; i < this.points.length; i++)
        innerWkt += this.points[i].x + ' ' + this.points[i].y + ',';

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
    var isEmpty = this.points.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.LineString, precision, isEmpty);

    if (this.points.length > 0) {
        twkb.writeVarInt(this.points.length);

        var lastX = 0;
        var lastY = 0;
        for (var i = 0; i < this.points.length; i++) {
            var x = this.points[i].x * precisionFactor;
            var y = this.points[i].y * precisionFactor;

            twkb.writeVarInt(ZigZag.encode(x - lastX));
            twkb.writeVarInt(ZigZag.encode(y - lastY));

            lastX = x;
            lastY = y;
        }
    }

    return twkb.buffer;
};

LineString.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 16);
};

LineString.prototype.toGeoJSON = function () {
    var geoJSON = {
        type: Types.geoJSON.LineString,
        coordinates: []
    };

    for (var i = 0; i < this.points.length; i++)
        geoJSON.coordinates.push([this.points[i].x, this.points[i].y]);

    return geoJSON;
};
