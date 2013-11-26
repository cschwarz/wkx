module.exports = Geometry;

var Types = require('./types');
var Point = require('./point');
var LineString = require('./linestring');
var Polygon = require('./polygon');
var GeometryCollection = require('./geometrycollection');
var BinaryReader = require('./binaryreader');

function Geometry() {
}

Geometry.parse = function (value) {
    var valueType = typeof value;

    if (valueType === 'string')
        return Geometry._parseWkt(value);
    else if (valueType === 'object' && (value instanceof Buffer || value instanceof BinaryReader))
        return Geometry._parseWkb(value);
    else
        throw new Error('first argument must to be a string or Buffer');
};

Geometry._parseWkt = function (value) {
};

Geometry._parseWkb = function (value) {
    var binaryReader;

    if (value instanceof BinaryReader)
        binaryReader = value;
    else
        binaryReader = new BinaryReader(value);

    binaryReader.isBigEndian = !binaryReader.readInt8();

    var geometryType = binaryReader.readInt32();

    switch (geometryType) {
    case Types.wkb.Point:
        return Point._parseWkb(binaryReader);
    case Types.wkb.LineString:
        return LineString._parseWkb(binaryReader);
    case Types.wkb.Polygon:
        return Polygon._parseWkb(binaryReader);
    case Types.wkb.GeometryCollection:
        return GeometryCollection._parseWkb(binaryReader);
    }
};