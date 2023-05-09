module.exports = Triangle;

var util = require('util');

var Polygon = require('./polygon');
var Types = require('./types');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');

function Triangle(exteriorRing, srid) {
    Polygon.call(this, exteriorRing, [], srid);
}

util.inherits(Triangle, Polygon);

Triangle.Z = function (exteriorRing, srid) {
    var triangle = new Triangle(exteriorRing, srid);
    triangle.hasZ = true;
    return triangle;
};

Triangle.M = function (exteriorRing, srid) {
    var triangle = new Triangle(exteriorRing, srid);
    triangle.hasM = true;
    return triangle;
};

Triangle.ZM = function (exteriorRing, srid) {
    var triangle = new Triangle(exteriorRing, srid);
    triangle.hasZ = true;
    triangle.hasM = true;
    return triangle;
};

Triangle._parseWkb = function (value, options) {
    var triangle = new Triangle();
    triangle.srid = options.srid;
    triangle.hasZ = options.hasZ;
    triangle.hasM = options.hasM;

    value.readUInt32();

    var exteriorRingCount = value.readUInt32();

    for (var i = 0; i < exteriorRingCount; i++) {
        triangle.exteriorRing.push(Point._readWkbPoint(value, options));
    }

    return triangle;
};

Triangle.prototype._toInnerWkt = function () {
    var innerWkt = '((';

    for (var i = 0; i < this.exteriorRing.length; i++)
        innerWkt += this._getWktCoordinate(this.exteriorRing[i]) + ',';

    innerWkt = innerWkt.slice(0, -1);
    innerWkt += ')';

    innerWkt += ')';

    return innerWkt;
};

Triangle.prototype.toWkb = function (parentOptions) {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    this._writeWkbType(wkb, Types.wkb.Triangle, parentOptions);

    wkb.writeUInt32LE(1);
    wkb.writeUInt32LE(this.exteriorRing.length);

    for (var i = 0; i < this.exteriorRing.length; i++)
        this.exteriorRing[i]._writeWkbPoint(wkb);

    return wkb.buffer;
};

Triangle.prototype._getWkbSize = function () {
    var coordinateSize = 16;

    if (this.hasZ)
        coordinateSize += 8;
    if (this.hasM)
        coordinateSize += 8;

    var size = 1 + 4 + 4;

    size += 4 + (this.exteriorRing.length * coordinateSize);

    return size;
};

