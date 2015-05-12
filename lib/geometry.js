module.exports = Geometry;

var Types = require('./types');
var Point = require('./point');
var LineString = require('./linestring');
var Polygon = require('./polygon');
var MultiPoint = require('./multipoint');
var MultiLineString = require('./multilinestring');
var MultiPolygon = require('./multipolygon');
var GeometryCollection = require('./geometrycollection');
var BinaryReader = require('./binaryreader');
var WktParser = require('./wktparser');

function Geometry() {
}

Geometry.parse = function (value, extended) {
    var valueType = typeof value;

    if (valueType === 'string' || value instanceof WktParser)
        return Geometry._parseWkt(value);
    else if (Buffer.isBuffer(value) || value instanceof BinaryReader)
        return Geometry._parseWkb(value, !!extended);
    else
        throw new Error('first argument must be a string or Buffer');
};

Geometry._parseWkt = function (value) {
    var wktParser;

    if (value instanceof WktParser)
        wktParser = value;
    else
        wktParser = new WktParser(value);

    var geometryType = wktParser.matchType();

    switch (geometryType) {
    case Types.wkt.Point:
        return Point._parseWkt(wktParser);
    case Types.wkt.LineString:
        return LineString._parseWkt(wktParser);
    case Types.wkt.Polygon:
        return Polygon._parseWkt(wktParser);
    case Types.wkt.MultiPoint:
        return MultiPoint._parseWkt(wktParser);
    case Types.wkt.MultiLineString:
        return MultiLineString._parseWkt(wktParser);
    case Types.wkt.MultiPolygon:
        return MultiPolygon._parseWkt(wktParser);
    case Types.wkt.GeometryCollection:
        return GeometryCollection._parseWkt(wktParser);
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }
};

Geometry._parseWkb = function (value, extended) {
    var binaryReader,
        srid,
        geometryType;

    if (value instanceof BinaryReader)
        binaryReader = value;
    else
        binaryReader = new BinaryReader(value);

    binaryReader.isBigEndian = !binaryReader.readInt8();

    if(extended) {
        geometryType = binaryReader.readUInt8();
        binaryReader.readUInt16();
        binaryReader.readUInt8();
        srid = binaryReader.readUInt16();
        binaryReader.readUInt16();
    } 
    else {
        geometryType = binaryReader.readUInt32();
    }

    switch (geometryType) {
    case Types.wkb.Point:
        return Point._parseWkb(binaryReader);
    case Types.wkb.LineString:
        return LineString._parseWkb(binaryReader);
    case Types.wkb.Polygon:
        return Polygon._parseWkb(binaryReader);
    case Types.wkb.MultiPoint:
        return MultiPoint._parseWkb(binaryReader);
    case Types.wkb.MultiLineString:
        return MultiLineString._parseWkb(binaryReader);
    case Types.wkb.MultiPolygon:
        return MultiPolygon._parseWkb(binaryReader);
    case Types.wkb.GeometryCollection:
        return GeometryCollection._parseWkb(binaryReader);
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }
};
