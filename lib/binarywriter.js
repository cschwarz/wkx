module.exports = BinaryWriter;

const __Buffer = require("buffer");

function BinaryWriter(size, allowResize) {
    this.buffer = new __Buffer(size);
    this.position = 0;
    this.allowResize = allowResize;
}

function _write(write, size) {
    return function (value, noAssert) {
        this.ensureSize(size);

        write.call(this.buffer, value, this.position, noAssert);
        this.position += size;
    };
}

BinaryWriter.prototype.writeUInt8 = _write(__Buffer.prototype.writeUInt8, 1);
BinaryWriter.prototype.writeUInt16LE = _write(
    __Buffer.prototype.writeUInt16LE,
    2
);
BinaryWriter.prototype.writeUInt16BE = _write(
    __Buffer.prototype.writeUInt16BE,
    2
);
BinaryWriter.prototype.writeUInt32LE = _write(
    __Buffer.prototype.writeUInt32LE,
    4
);
BinaryWriter.prototype.writeUInt32BE = _write(
    __Buffer.prototype.writeUInt32BE,
    4
);
BinaryWriter.prototype.writeInt8 = _write(__Buffer.prototype.writeInt8, 1);
BinaryWriter.prototype.writeInt16LE = _write(
    __Buffer.prototype.writeInt16LE,
    2
);
BinaryWriter.prototype.writeInt16BE = _write(
    __Buffer.prototype.writeInt16BE,
    2
);
BinaryWriter.prototype.writeInt32LE = _write(
    __Buffer.prototype.writeInt32LE,
    4
);
BinaryWriter.prototype.writeInt32BE = _write(
    __Buffer.prototype.writeInt32BE,
    4
);
BinaryWriter.prototype.writeFloatLE = _write(
    __Buffer.prototype.writeFloatLE,
    4
);
BinaryWriter.prototype.writeFloatBE = _write(
    __Buffer.prototype.writeFloatBE,
    4
);
BinaryWriter.prototype.writeDoubleLE = _write(
    __Buffer.prototype.writeDoubleLE,
    8
);
BinaryWriter.prototype.writeDoubleBE = _write(
    __Buffer.prototype.writeDoubleBE,
    8
);

BinaryWriter.prototype.write__Buffer = function (buffer) {
    this.ensureSize(buffer.length);

    buffer.copy(this.buffer, this.position, 0, buffer.length);
    this.position += buffer.length;
};

BinaryWriter.prototype.writeVarInt = function (value) {
    var length = 1;

    while ((value & 0xffffff80) !== 0) {
        this.writeUInt8((value & 0x7f) | 0x80);
        value >>>= 7;
        length++;
    }

    this.writeUInt8(value & 0x7f);

    return length;
};

BinaryWriter.prototype.ensureSize = function (size) {
    if (this.buffer.length < this.position + size) {
        if (this.allowResize) {
            var temp__Buffer = new __Buffer(this.position + size);
            this.buffer.copy(temp__Buffer, 0, 0, this.buffer.length);
            this.buffer = temp__Buffer;
        } else {
            throw new RangeError("index out of range");
        }
    }
};
