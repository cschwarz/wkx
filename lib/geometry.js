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
var BinaryWriter = require('./binarywriter');
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
    var wktParser,
        srid;

    if (value instanceof WktParser)
        wktParser = value;
    else
        wktParser = new WktParser(value);
        
    var match = wktParser.matchRegex([/^SRID=(\d+);/]);
    if (match)
        srid = match[1];

    var geometryType = wktParser.matchType();
    
    var options = {
        srid: srid || 0
    };

    switch (geometryType) {
    case Types.wkt.Point:
        return Point._parseWkt(wktParser, options);
    case Types.wkt.LineString:
        return LineString._parseWkt(wktParser, options);
    case Types.wkt.Polygon:
        return Polygon._parseWkt(wktParser, options);
    case Types.wkt.MultiPoint:
        return MultiPoint._parseWkt(wktParser, options);
    case Types.wkt.MultiLineString:
        return MultiLineString._parseWkt(wktParser, options);
    case Types.wkt.MultiPolygon:
        return MultiPolygon._parseWkt(wktParser, options);
    case Types.wkt.GeometryCollection:
        return GeometryCollection._parseWkt(wktParser, options);
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

Geometry.prototype.toEwkt = function () {
    return 'SRID=' + this.srid + ';' + this.toWkt();   
};

Geometry.prototype.toEwkb = function () {    
    var ewkb = new BinaryWriter(this._getWkbSize() + 4);
    var wkb = this.toWkb();
    
    ewkb.writeInt8(1);
    ewkb.writeUInt32LE(wkb.slice(1, 5).readUInt32LE(0) | 0x20000000);
    ewkb.writeUInt32LE(this.srid);
        
    ewkb.writeBuffer(wkb.slice(5));
    
    return ewkb.buffer;
};
