module.exports = Polygon;

var Types = require('./types');
var BinaryWriter = require('./binarywriter');

function Polygon(exteriorRing, interiorRings) {
    this.exteriorRing = exteriorRing || [];
    this.interiorRings = interiorRings || [];
}

Polygon.prototype.toWkt = function () {
    if (this.exteriorRing.length === 0)
        return Types.wkt.Polygon + ' EMPTY';

    var wkt = Types.wkt.Polygon + '((';

    for (var i = 0; i < this.exteriorRing.length; i++)
        wkt += this.exteriorRing[i].x + ' ' + this.exteriorRing[i].y + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    for (i = 0; i < this.interiorRings.length; i++) {
        wkt += ',(';

        for (var j = 0; j < this.interiorRings[i].length; j++) {
            wkt += this.interiorRings[i][j].x + ' ' + this.interiorRings[i][j].y + ',';
        }

        wkt = wkt.slice(0, -1);
        wkt += ')';
    }

    wkt += ')';

    return wkt;
};

Polygon.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeInt32LE(Types.wkb.Polygon);

    if (this.exteriorRing.length > 0) {
        wkb.writeInt32LE(1 + this.interiorRings.length);
        wkb.writeInt32LE(this.exteriorRing.length);
    }
    else {
        wkb.writeInt32LE(0);
    }

    for (var i = 0; i < this.exteriorRing.length; i++) {
        wkb.writeDoubleLE(this.exteriorRing[i].x);
        wkb.writeDoubleLE(this.exteriorRing[i].y);
    }

    for (i = 0; i < this.interiorRings.length; i++) {
        wkb.writeInt32LE(this.interiorRings[i].length);

        for (var j = 0; j < this.interiorRings[i].length; j++) {
            wkb.writeDoubleLE(this.interiorRings[i][j].x);
            wkb.writeDoubleLE(this.interiorRings[i][j].y);
        }
    }

    return wkb.buffer;
};

Polygon.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    if (this.exteriorRing.length > 0)
        size += 4 + (this.exteriorRing.length * 16);

    for (var i = 0; i < this.interiorRings.length; i++)
        size += 4 + (this.interiorRings[i].length * 16);

    return size;
};