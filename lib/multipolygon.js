module.exports = MultiPolygon;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var Polygon = require('./polygon');
var BinaryWriter = require('./binarywriter');

function MultiPolygon(polygons) {
    Geometry.call(this);
    
    this.polygons = polygons || [];
}

util.inherits(MultiPolygon, Geometry);

MultiPolygon._parseWkt = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return multiPolygon;

    value.expectGroupStart();

    do {
        value.expectGroupStart();

        var polygon = new Polygon();

        value.expectGroupStart();
        polygon.exteriorRing.push.apply(polygon.exteriorRing, value.matchCoordinates());
        value.expectGroupEnd();

        while (value.isMatch([','])) {
            value.expectGroupStart();
            polygon.interiorRings.push(value.matchCoordinates());
            value.expectGroupEnd();
        }

        multiPolygon.polygons.push(polygon);

        value.expectGroupEnd();

    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiPolygon;
};

MultiPolygon._parseWkb = function (value, options) {
    var multiPolygon = new MultiPolygon();
    multiPolygon.srid = options.srid;

    var polygonCount = value.readUInt32();

    for (var i = 0; i < polygonCount; i++)
        multiPolygon.polygons.push(Geometry.parse(value));

    return multiPolygon;
};

MultiPolygon.prototype.toWkt = function () {
    if (this.polygons.length === 0)
        return Types.wkt.MultiPolygon + ' EMPTY';

    var wkt = Types.wkt.MultiPolygon + '(';

    for (var i = 0; i < this.polygons.length; i++)
        wkt += this.polygons[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPolygon.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.MultiPolygon);
    wkb.writeUInt32LE(this.polygons.length);

    for (var i = 0; i < this.polygons.length; i++)
        wkb.writeBuffer(this.polygons[i].toWkb());

    return wkb.buffer;
};

MultiPolygon.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.polygons.length; i++)
        size += this.polygons[i]._getWkbSize();

    return size;
};
