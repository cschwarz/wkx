module.exports = GeometryCollection;

var Types = require('./types');
var BinaryWriter = require('./binarywriter');

function GeometryCollection(geometries) {
    this.geometries = geometries || [];
}

GeometryCollection.prototype.toWkt = function () {
    if (this.geometries.length === 0)
        return Types.wkt.GeometryCollection + ' EMPTY';

    var wkt = Types.wkt.GeometryCollection + '(';

    for (var i = 0; i < this.geometries.length; i++)
        wkt += this.geometries[i].toWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

GeometryCollection.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeInt32LE(Types.wkb.GeometryCollection);
    wkb.writeInt32LE(this.geometries.length);

    for (var i = 0; i < this.geometries.length; i++)
        wkb.writeBuffer(this.geometries[i].toWkb());

    return wkb.buffer;
};

GeometryCollection.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.geometries.length; i++)
        size += this.geometries[i]._getWkbSize();

    return size;
};