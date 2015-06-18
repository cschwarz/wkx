var fs = require('fs');
var pg = require('pg');
var async = require('async');

var testdata = JSON.parse(fs.readFileSync('./test/testdata.json', { encoding: 'utf8' }));

var connectionString = 'postgres://postgres:postgres@localhost/postgres';

var client = new pg.Client(connectionString);
client.connect(function(err) {
    async.forEachOf(testdata, function (value, key, callback) {
        client.query('SELECT encode(ST_AsBinary(ST_GeomFromText($1)), \'hex\') wkb, ' +
                     'encode(ST_AsEwkb(ST_GeomFromText($1, 4326)), \'hex\') ewkb, ' +
                     'encode(ST_AsBinary(ST_GeomFromText($1), \'xdr\'), \'hex\') wkbXdr, ' +
                     'encode(ST_AsEwkb(ST_GeomFromText($1, 4326), \'xdr\'), \'hex\') ewkbXdr, ' +
                     'ST_AsGeoJSON(ST_GeomFromText($1, 4326)) geojson', [value.wkt], function (err, result) {

            value.wkb = result.rows[0].wkb;
            value.ewkb = result.rows[0].ewkb;
            value.wkbXdr = result.rows[0].wkbXdr;
            value.ewkbXdr = result.rows[0].ewkbXdr;
            value.geojson = result.rows[0].geojson;

            callback();
        });
    }, function () {
        client.end();
        fs.writeFileSync('./test/testdata.json', JSON.stringify(testdata, null, 2));
    });
});
