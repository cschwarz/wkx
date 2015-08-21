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
var ZigZag = require('./zigzag.js');

function Geometry() {
    this.srid = 0;
    this.hasZ = false;
    this.hasM = false;
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
    var dimension = wktParser.matchDimension();

    var options = {
        srid: srid || 0,
        hasZ: dimension.hasZ,
        hasM: dimension.hasM
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

Geometry.parseTwkb = function (value) {
    var binaryReader,
        options = {};

    if (value instanceof BinaryReader)
        binaryReader = value;
    else
        binaryReader = new BinaryReader(value);

    var type = binaryReader.readUInt8();
    var metadataHeader = binaryReader.readUInt8();

    var geometryType = type & 0x0F;
    options.precision = ZigZag.decode(type >> 4);
    options.precisionFactor = Math.pow(10, options.precision);

    options.hasBoundingBox = metadataHeader >> 0 & 1;
    options.hasSizeAttribute = metadataHeader >> 1 & 1;
    options.hasIdList = metadataHeader >> 2 & 1;
    options.hasExtendedPrecision = metadataHeader >> 3 & 1;
    options.isEmpty = metadataHeader >> 4 & 1;

    if (options.hasExtendedPrecision) {
        var extendedPrecision = binaryReader.readUInt8();
        options.hasZ = (extendedPrecision & 0x01) === 0x01;
        options.hasM = (extendedPrecision & 0x02) === 0x02;
        
        options.zPrecision = ZigZag.decode((extendedPrecision & 0x1C) >> 2);
        options.zPrecisionFactor = Math.pow(10, options.zPrecision);
        
        options.mPrecision = ZigZag.decode((extendedPrecision & 0xE0) >> 5);
        options.mPrecisionFactor = Math.pow(10, options.mPrecision);
    }
    else {
        options.hasZ = false;
        options.hasM = false;
    }
    
    if (options.hasSizeAttribute)
        binaryReader.readVarInt();
    if (options.hasBoundingBox) {
        var dimensions = 2;

        if (options.hasZ)
            dimensions++;
        if (options.hasM)
            dimensions++;

        for (var i = 0; i < dimensions; i++) {
            binaryReader.readVarInt();
            binaryReader.readVarInt();
        }
    }

    switch (geometryType) {
    case Types.wkb.Point:
        return Point._parseTwkb(binaryReader, options);
    case Types.wkb.LineString:
        return LineString._parseTwkb(binaryReader, options);
    case Types.wkb.Polygon:
        return Polygon._parseTwkb(binaryReader, options);
    case Types.wkb.MultiPoint:
        return MultiPoint._parseTwkb(binaryReader, options);
    case Types.wkb.MultiLineString:
        return MultiLineString._parseTwkb(binaryReader, options);
    case Types.wkb.MultiPolygon:
        return MultiPolygon._parseTwkb(binaryReader, options);
    case Types.wkb.GeometryCollection:
        return GeometryCollection._parseTwkb(binaryReader, options);
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }
};

Geometry.parseGeoJSON = function (value) {
    var geometry;

    switch (value.type) {
    case Types.geoJSON.Point:
        geometry = Point._parseGeoJSON(value); break;
    case Types.geoJSON.LineString:
        geometry = LineString._parseGeoJSON(value); break;
    case Types.geoJSON.Polygon:
        geometry = Polygon._parseGeoJSON(value); break;
    case Types.geoJSON.MultiPoint:
        geometry = MultiPoint._parseGeoJSON(value); break;
    case Types.geoJSON.MultiLineString:
        geometry = MultiLineString._parseGeoJSON(value); break;
    case Types.geoJSON.MultiPolygon:
        geometry = MultiPolygon._parseGeoJSON(value); break;
    case Types.geoJSON.GeometryCollection:
        geometry = GeometryCollection._parseGeoJSON(value); break;
    default:
        throw new Error('GeometryType ' + value.type + ' not supported');
    }

    if (value.crs && value.crs.type && value.crs.type === 'name' && value.crs.properties && value.crs.properties.name) {
        var crs = value.crs.properties.name;

        if (crs.indexOf('EPSG:') === 0)
            geometry.srid = parseInt(crs.substring(5));
        else if (crs.indexOf('urn:ogc:def:crs:EPSG::') === 0)
            geometry.srid = parseInt(crs.substring(22));
    }

    return geometry;
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

Geometry.prototype._getWktType = function (wktType, isEmpty) {
    var wkt = wktType;

    if (this.hasZ && this.hasM)
        wkt += ' ZM ';
    else if (this.hasZ)
        wkt += ' Z ';
    else if (this.hasM)
        wkt += ' M ';

    if (isEmpty && !this.hasZ && !this.hasM)
        wkt += ' ';

    if (isEmpty)
        wkt += 'EMPTY';

    return wkt;
};

Geometry.prototype._getWktCoordinate = function (point) {
    var coordinates = point.x + ' ' + point.y;

    if (this.hasZ)
        coordinates += ' ' + point.z;
    if (this.hasM)
        coordinates += ' ' + point.m;

    return coordinates;
};

Geometry.prototype._writeTwkbHeader = function (twkb, geometryType, precision, zPrecision, mPrecision, isEmpty) {
    var type = (ZigZag.encode(precision) << 4) + geometryType;    
    var metadataHeader = (this.hasZ || this.hasM) << 3;
    metadataHeader += isEmpty << 4;
    
    twkb.writeUInt8(type);
    twkb.writeUInt8(metadataHeader);
    
    if (this.hasZ || this.hasM) {
        var extendedPrecision = 0;
        if (this.hasZ)
            extendedPrecision |= 0x1;
        if (this.hasM)
            extendedPrecision |= 0x2;
        
        twkb.writeUInt8(extendedPrecision);
    }
};

Geometry.prototype.toGeoJSON = function (options) {
    var geoJSON = {};

    if (this.srid) {
        if (options) {
            if (options.shortCrs) {
                geoJSON.crs = {
                    type: 'name',
                    properties: {
                        name: 'EPSG:' + this.srid
                    }
                };
            }
            else if (options.longCrs) {
                geoJSON.crs = {
                    type: 'name',
                    properties: {
                        name: 'urn:ogc:def:crs:EPSG::' + this.srid
                    }
                };
            }
        }
    }

    return geoJSON;
};
