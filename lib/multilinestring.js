module.exports = MultiLineString;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var Point = require('./point');
var LineString = require('./linestring');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag.js');

function MultiLineString(lineStrings) {
    Geometry.call(this);

    this.lineStrings = lineStrings || [];
}

util.inherits(MultiLineString, Geometry);

MultiLineString._parseWkt = function (value, options) {
    var multiLineString = new MultiLineString();
    multiLineString.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return multiLineString;

    value.expectGroupStart();

    do {
        value.expectGroupStart();
        multiLineString.lineStrings.push(new LineString(value.matchCoordinates()));
        value.expectGroupEnd();
    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiLineString;
};

MultiLineString._parseWkb = function (value, options) {
    var multiLineString = new MultiLineString();
    multiLineString.srid = options.srid;

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        multiLineString.lineStrings.push(Geometry.parse(value));

    return multiLineString;
};

MultiLineString._parseTwkb = function (value, options) {
    var multiLineString = new MultiLineString();

    if (options.isEmpty)
        return multiLineString;

    var x = 0;
    var y = 0;
    var lineStringCount = value.readVarInt();

    for (var i = 0; i < lineStringCount; i++) {
        var lineString = new LineString();
        var pointCount = value.readVarInt();

        for (var j = 0; j < pointCount; j++) {
            x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
            y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

            lineString.points.push(new Point(x, y));
        }

        multiLineString.lineStrings.push(lineString);
    }

    return multiLineString;
};

MultiLineString.prototype.toWkt = function () {
    if (this.lineStrings.length === 0)
        return Types.wkt.MultiLineString + ' EMPTY';

    var wkt = Types.wkt.MultiLineString + '(';

    for (var i = 0; i < this.lineStrings.length; i++)
        wkt += this.lineStrings[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiLineString.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.MultiLineString);
    wkb.writeUInt32LE(this.lineStrings.length);

    for (var i = 0; i < this.lineStrings.length; i++)
        wkb.writeBuffer(this.lineStrings[i].toWkb());

    return wkb.buffer;
};

MultiLineString.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.lineStrings.length; i++)
        size += this.lineStrings[i]._getWkbSize();

    return size;
};

MultiLineString.prototype.toGeoJSON = function () {
    var geoJSON = {
        type: 'MultiLineString',
        coordinates: []
    };

    for (var i = 0; i < this.lineStrings.length; i++)
        geoJSON.coordinates.push(this.lineStrings[i].toGeoJSON().coordinates);

    return geoJSON;
};
