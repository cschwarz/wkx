module.exports = {
    decode: function (value) {
        return (value >> 1) ^ (-(value & 1));
    }
};
