module.exports = GeometryFormat;

function GeometryFormat(name, sqlAsFunction, sqlFromFunction, isBinary, srid, sqlAdditionalFlags) {
    this.name = name;
    this.sqlAsFunction = sqlAsFunction;
    this.sqlFromFunction = sqlFromFunction;
    this.isBinary = isBinary;
    this.srid = srid;
    this.sqlAdditionalFlags = sqlAdditionalFlags;
}

GeometryFormat.prototype.generateSql = function () {
    var targetSql = this.sqlAsFunction + '(ST_GeomFromText($1' + 
        (this.srid ? ', ' + this.srid : '') + ')' +
        (this.sqlAdditionalFlags ? ', ' + this.sqlAdditionalFlags : '') + 
        ')';
    
    var targetAsText = 'ST_AsText(' + this.sqlFromFunction + '(' + targetSql + '))';

    if (this.isBinary)
        targetSql = 'encode(' + targetSql + ', \'hex\')';

    return 'SELECT ' + targetSql + ' ' + this.name + ', ' + targetAsText + ' ' + this.name + 'result';
};
