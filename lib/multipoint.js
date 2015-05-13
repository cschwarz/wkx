module.exports = MultiPoint;

var util = require('util');

var Types = require('./types');
var Geometry = require('./geometry');
var BinaryWriter = require('./binarywriter');

function MultiPoint(points) {
    Geometry.call(this);
    
    this.points = points || [];
}

util.inherits(MultiPoint, Geometry);

MultiPoint._parseWkt = function (value, options) {
    var multiPoint = new MultiPoint();
    multiPoint.srid = options.srid;

    if (value.isMatch(['EMPTY']))
        return multiPoint;

    value.expectGroupStart();
    multiPoint.points.push.apply(multiPoint.points, value.matchCoordinates());
    value.expectGroupEnd();

    return multiPoint;
};

MultiPoint._parseWkb = function (value, options) {
    var multiPoint = new MultiPoint(); 
    multiPoint.srid = options.srid;

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        multiPoint.points.push(Geometry.parse(value));

    return multiPoint;
};

MultiPoint.prototype.toWkt = function () {
    if (this.points.length === 0)
        return Types.wkt.MultiPoint + ' EMPTY';

    var wkt = Types.wkt.MultiPoint + '(';

    for (var i = 0; i < this.points.length; i++)
        wkt += this.points[i].x + ' ' + this.points[i].y + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPoint.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.MultiPoint);
    wkb.writeUInt32LE(this.points.length);

    for (var i = 0; i < this.points.length; i++)
        wkb.writeBuffer(this.points[i].toWkb());

    return wkb.buffer;
};

MultiPoint.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 21);
};
