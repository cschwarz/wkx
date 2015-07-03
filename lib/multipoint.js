module.exports = MultiPoint;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag');

function MultiPoint(points) {
    Geometry.call(this);

    this.points = points || [];
}

util.inherits(MultiPoint, Geometry);

MultiPoint._parseWkt = function (value, options) {
    var multiPoint = new MultiPoint();
    multiPoint.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return multiPoint;

    value.expectGroupStart();
    multiPoint.points.push.apply(multiPoint.points, value.matchCoordinates());
    value.expectGroupEnd();

    return multiPoint;
};

MultiPoint._parseWkb = function (value, options) {
    var multiPoint = new MultiPoint();
    multiPoint.srid = options.srid;

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        multiPoint.points.push(Geometry.parse(value));

    return multiPoint;
};

MultiPoint._parseTwkb = function (value, options) {
    var multiPoint = new MultiPoint();

    if (options.isEmpty)
        return multiPoint;

    var pointCount = value.readVarInt();

    var x = 0;
    var y = 0;

    for (var i = 0; i < pointCount; i++) {
        x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
        y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

        multiPoint.points.push(new Point(x, y));
    }

    return multiPoint;
};

MultiPoint._parseGeoJSON = function (value) {
    var multiPoint = new MultiPoint();

    for (var i = 0; i < value.coordinates.length; i++)
        multiPoint.points.push(Point._parseGeoJSON({ coordinates: value.coordinates[i] }));

    return multiPoint;
};

MultiPoint.prototype.toWkt = function () {
    if (this.points.length === 0)
        return Types.wkt.MultiPoint + ' EMPTY';

    var wkt = Types.wkt.MultiPoint + '(';

    for (var i = 0; i < this.points.length; i++)
        wkt += this.points[i].x + ' ' + this.points[i].y + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPoint.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.MultiPoint);
    wkb.writeUInt32LE(this.points.length);

    for (var i = 0; i < this.points.length; i++)
        wkb.writeBuffer(this.points[i].toWkb());

    return wkb.buffer;
};

MultiPoint.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var isEmpty = this.points.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.MultiPoint, precision, isEmpty);

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

MultiPoint.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 21);
};

MultiPoint.prototype.toGeoJSON = function () {
    var geoJSON = {
        type: Types.geoJSON.MultiPoint,
        coordinates: []
    };

    for (var i = 0; i < this.points.length; i++)
        geoJSON.coordinates.push(this.points[i].toGeoJSON().coordinates);

    return geoJSON;
};
