module.exports = GeometryCollection;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var BinaryWriter = require('./binarywriter');
var ZigZag = require('./zigzag.js');

function GeometryCollection(geometries) {
    Geometry.call(this);

    this.geometries = geometries || [];
}

util.inherits(GeometryCollection, Geometry);

GeometryCollection._parseWkt = function (value, options) {
    var geometryCollection = new GeometryCollection();
    geometryCollection.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return geometryCollection;

    value.expectGroupStart();

    do {
        geometryCollection.geometries.push(Geometry.parse(value));
    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return geometryCollection;
};

GeometryCollection._parseWkb = function (value, options) {
    var geometryCollection = new GeometryCollection();
    geometryCollection.srid = options.srid;

    var geometryCount = value.readUInt32();

    for (var i = 0; i < geometryCount; i++)
        geometryCollection.geometries.push(Geometry.parse(value));

    return geometryCollection;
};

GeometryCollection._parseTwkb = function (value, options) {
    var geometryCollection = new GeometryCollection();

    if (options.isEmpty)
        return geometryCollection;

    var geometryCount = value.readVarInt();

    for (var i = 0; i < geometryCount; i++)
        geometryCollection.geometries.push(Geometry.parseTwkb(value));

    return geometryCollection;
};

GeometryCollection._parseGeoJSON = function (value) {
    var geometryCollection = new GeometryCollection();

    for (var i = 0; i < value.geometries.length; i++)
        geometryCollection.geometries.push(Geometry.parseGeoJSON(value.geometries[i]));

    return geometryCollection;
};

GeometryCollection.prototype.toWkt = function () {
    if (this.geometries.length === 0)
        return Types.wkt.GeometryCollection + ' EMPTY';

    var wkt = Types.wkt.GeometryCollection + '(';

    for (var i = 0; i < this.geometries.length; i++)
        wkt += this.geometries[i].toWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

GeometryCollection.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.GeometryCollection);
    wkb.writeUInt32LE(this.geometries.length);

    for (var i = 0; i < this.geometries.length; i++)
        wkb.writeBuffer(this.geometries[i].toWkb());

    return wkb.buffer;
};

GeometryCollection.prototype.toTwkb = function () {
    var twkb = new BinaryWriter(0, true);

    var precision = 5;
    var precisionFactor = Math.pow(10, precision);
    var isEmpty = this.geometries.length === 0;

    this._writeTwkbHeader(twkb, Types.wkb.GeometryCollection, precision, isEmpty);

    if (this.geometries.length > 0) {
        twkb.writeVarInt(this.geometries.length);

        for (var i = 0; i < this.geometries.length; i++)
            twkb.writeBuffer(this.geometries[i].toTwkb());
    }

    return twkb.buffer;
};

GeometryCollection.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.geometries.length; i++)
        size += this.geometries[i]._getWkbSize();

    return size;
};

GeometryCollection.prototype.toGeoJSON = function () {
    var geoJSON = {
        type: Types.geoJSON.GeometryCollection,
        geometries: []
    };

    for (var i = 0; i < this.geometries.length; i++)
        geoJSON.geometries.push(this.geometries[i].toGeoJSON());

    return geoJSON;
};
