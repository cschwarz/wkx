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
    this.srid = 0;
}

Geometry.parse = function (value) {
    var valueType = typeof value;

    if (valueType === 'string' || value instanceof WktParser)
        return Geometry._parseWkt(value);
    else if (Buffer.isBuffer(value) || value instanceof BinaryReader)
        return Geometry._parseWkb(value);
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

Geometry._parseWkb = function (value) {
    var binaryReader,
        hasSrid,
        srid,
        wkbType,
        geometryType;

    if (value instanceof BinaryReader)
        binaryReader = value;
    else
        binaryReader = new BinaryReader(value);

    binaryReader.isBigEndian = !binaryReader.readInt8();

    wkbType = binaryReader.readUInt32();
    geometryType = wkbType & 0xFF;    
    
    hasSrid = (wkbType & 0x20000000) === 0x20000000;
        
    if (hasSrid)
        srid = binaryReader.readUInt32();
    
    var options = {
        srid: srid || 0
    };

    switch (geometryType) {
    case Types.wkb.Point:
        return Point._parseWkb(binaryReader, options);
    case Types.wkb.LineString:
        return LineString._parseWkb(binaryReader, options);
    case Types.wkb.Polygon:
        return Polygon._parseWkb(binaryReader, options);
    case Types.wkb.MultiPoint:
        return MultiPoint._parseWkb(binaryReader, options);
    case Types.wkb.MultiLineString:
        return MultiLineString._parseWkb(binaryReader, options);
    case Types.wkb.MultiPolygon:
        return MultiPolygon._parseWkb(binaryReader, options);
    case Types.wkb.GeometryCollection:
        return GeometryCollection._parseWkb(binaryReader, options);
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }
};
