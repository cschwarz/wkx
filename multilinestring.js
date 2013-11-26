module.exports = MultiLineString;

var Types = require('./types');
var Geometry = require('./geometry');
var BinaryWriter = require('./binarywriter');

function MultiLineString(lineStrings) {
    this.lineStrings = lineStrings || [];
}

MultiLineString._parseWkt = function (value) {
};

MultiLineString._parseWkb = function (value) {
    var multiLineString = new MultiLineString();

    var pointCount = value.readInt32();

    for (var i = 0; i < pointCount; i++)
        multiLineString.lineStrings.push(Geometry.parse(value));

    return multiLineString;
};

MultiLineString.prototype.toWkt = function () {
    if (this.lineStrings.length === 0)
        return Types.wkt.MultiLineString + ' EMPTY';

    var wkt = Types.wkt.MultiLineString + '(';

    for (var i = 0; i < this.lineStrings.length; i++)
        wkt += this.lineStrings[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiLineString.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeInt32LE(Types.wkb.MultiLineString);
    wkb.writeInt32LE(this.lineStrings.length);

    for (var i = 0; i < this.lineStrings.length; i++)
        wkb.writeBuffer(this.lineStrings[i].toWkb());

    return wkb.buffer;
};

MultiLineString.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.lineStrings.length; i++)
        size += this.lineStrings[i]._getWkbSize();

    return size;
};