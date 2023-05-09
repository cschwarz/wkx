module.exports = Tin;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var Triangle = require('./triangle');
var BinaryWriter = require('./binarywriter');

function Tin(triangles, srid) {
    Geometry.call(this);

    this.triangles = triangles || [];
	this.srid = srid;

    if (this.triangles.length > 0) {
        this.hasZ = this.triangles[0].hasZ;
        this.hasM = this.triangles[0].hasM;
    }
}

util.inherits(Tin, Geometry);

Tin.Z = function (triangles, srid) {
    var tin = new Tin(triangles, srid);
    tin.hasZ = true;
    return tin;
};

Tin.M = function (triangles, srid) {
    var tin = new Tin(triangles, srid);
    tin.hasM = true;
    return tin;
};

Tin.ZM = function (triangles, srid) {
    var tin = new Tin(triangles, srid);
    tin.hasZ = true;
    tin.hasM = true;
    return tin;
};

Tin._parseWkt = function (value, options) {
    var tin = new Tin();
    tin.srid = options.srid;
    tin.hasZ = options.hasZ;
    tin.hasM = options.hasM;

    if (value.isMatch(['EMPTY']))
        return tin;

    value.expectGroupStart();

    do {
        value.expectGroupStart();

        var exteriorRing = [];

        value.expectGroupStart();
        exteriorRing.push.apply(exteriorRing, value.matchCoordinates(options));
        value.expectGroupEnd();

        tin.triangles.push(new Triangle(exteriorRing));

        value.expectGroupEnd();

    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return tin;
};

Tin._parseWkb = function (value, options) {
    var tin = new Tin();
    tin.srid = options.srid;
    tin.hasZ = options.hasZ;
    tin.hasM = options.hasM;

    var polygonCount = value.readUInt32();

    for (var i = 0; i < polygonCount; i++)
        tin.triangles.push(Geometry.parse(value, options));

    return tin;
};

Tin.prototype.toWkt = function () {
    if (this.triangles.length === 0)
        return this._getWktType(Types.wkt.Tin, true);

    var wkt = this._getWktType(Types.wkt.Tin, false) + '(';

    for (var i = 0; i < this.triangles.length; i++)
        wkt += this.triangles[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

Tin.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    this._writeWkbType(wkb, Types.wkb.Tin);
    wkb.writeUInt32LE(this.triangles.length);

    for (var i = 0; i < this.triangles.length; i++)
        wkb.writeBuffer(this.triangles[i].toWkb({ srid: this.srid }));

    return wkb.buffer;
};

Tin.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.triangles.length; i++)
        size += this.triangles[i]._getWkbSize();

    return size;
};
