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

MultiLineString.Z = function (lineStrings) {
    var multiLineString = new MultiLineString(lineStrings);
    multiLineString.hasZ = true;
    return multiLineString;
};

MultiLineString.M = function (lineStrings) {
    var multiLineString = new MultiLineString(lineStrings);
    multiLineString.hasM = true;
    return multiLineString;
};

MultiLineString.ZM = function (lineStrings) {
    var multiLineString = new MultiLineString(lineStrings);
    multiLineString.hasZ = true;
    multiLineString.hasM = true;
    return multiLineString;
};

MultiLineString._parseWkt = function (value, options) {
    var multiLineString = new MultiLineString();
    multiLineString.srid = options.srid;
    multiLineString.hasZ = options.hasZ;
    multiLineString.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return multiLineString;

    value.expectGroupStart();

    do {
        value.expectGroupStart();
        multiLineString.lineStrings.push(new LineString(value.matchCoordinates(options)));                
        value.expectGroupEnd();
    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiLineString;
};

MultiLineString._parseWkb = function (value, options) {
    var multiLineString = new MultiLineString();
    multiLineString.srid = options.srid;
    multiLineString.hasZ = options.hasZ;
    multiLineString.hasM = options.hasM;

    var lineStringCount = value.readUInt32();

    for (var i = 0; i < lineStringCount; i++)
        multiLineString.lineStrings.push(Geometry.parse(value, options));

    return multiLineString;
};

MultiLineString._parseTwkb = function (value, options) {
    var multiLineString = new MultiLineString();
    multiLineString.hasZ = options.hasZ;
    multiLineString.hasM = options.hasM;

    if (options.isEmpty)
        return multiLineString;

    var x = 0;
    var y = 0;
    var z = options.hasZ ? 0 : undefined;
    var m = options.hasM ? 0 : undefined;
    var lineStringCount = value.readVarInt();

    for (var i = 0; i < lineStringCount; i++) {
        var lineString = new LineString();
        lineString.hasZ = options.hasZ;
        lineString.hasM = options.hasM;
        
        var pointCount = value.readVarInt();

        for (var j = 0; j < pointCount; j++) {
            x += ZigZag.decode(value.readVarInt()) / options.precisionFactor;
            y += ZigZag.decode(value.readVarInt()) / options.precisionFactor;

            if (options.hasZ)
                z += ZigZag.decode(value.readVarInt()) / options.zPrecisionFactor;
            if (options.hasM)
                m += ZigZag.decode(value.readVarInt()) / options.mPrecisionFactor;
            
            lineString.points.push(new Point(x, y, z, m));
        }

        multiLineString.lineStrings.push(lineString);
    }

    return multiLineString;
};

MultiLineString._parseGeoJSON = function (value) {
    var multiLineString = new MultiLineString();
    
    if (value.coordinates.length > 0 && value.coordinates[0].length > 0)
        multiLineString.hasZ = value.coordinates[0][0].length > 2;

    for (var i = 0; i < value.coordinates.length; i++)
        multiLineString.lineStrings.push(LineString._parseGeoJSON({ coordinates: value.coordinates[i] }));

    return multiLineString;
};

MultiLineString.prototype.toWkt = function () {
    if (this.lineStrings.length === 0)
        return this._getWktType(Types.wkt.MultiLineString, true);

    var wkt = this._getWktType(Types.wkt.MultiLineString, false) + '(';

    for (var i = 0; i < this.lineStrings.length; i++)
        wkt += this.lineStrings[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiLineString.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    this._writeWkbType(wkb, Types.wkb.MultiLineString);
    wkb.writeUInt32LE(this.lineStrings.length);

    for (var i = 0; i < this.lineStrings.length; i++)
        wkb.writeBuffer(this.lineStrings[i].toWkb({ srid: this.srid }));

    return wkb.buffer;
};

MultiLineString.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var zPrecision = 0;
    var zPrecisionFactor = Math.pow(10, zPrecision);
    var mPrecision = 0;
    var mPrecisionFactor = Math.pow(10, mPrecision);
    var isEmpty = this.lineStrings.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.MultiLineString, precision, zPrecision, mPrecision, isEmpty);

    if (this.lineStrings.length > 0) {
        twkb.writeVarInt(this.lineStrings.length);

        var lastX = 0;
        var lastY = 0;
        var lastZ = 0;
        var lastM = 0;
        for (var i = 0; i < this.lineStrings.length; i++) {
            twkb.writeVarInt(this.lineStrings[i].points.length);

            for (var j = 0; j < this.lineStrings[i].points.length; j++) {
                var x = this.lineStrings[i].points[j].x * precisionFactor;
                var y = this.lineStrings[i].points[j].y * precisionFactor;
                var z = this.lineStrings[i].points[j].z * zPrecisionFactor;
                var m = this.lineStrings[i].points[j].m * mPrecisionFactor;

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

MultiLineString.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.lineStrings.length; i++)
        size += this.lineStrings[i]._getWkbSize();

    return size;
};

MultiLineString.prototype.toGeoJSON = function (options) {
    var geoJSON = Geometry.prototype.toGeoJSON.call(this, options);
    geoJSON.type = Types.geoJSON.MultiLineString;
    geoJSON.coordinates = [];

    for (var i = 0; i < this.lineStrings.length; i++)
        geoJSON.coordinates.push(this.lineStrings[i].toGeoJSON().coordinates);

    return geoJSON;
};
