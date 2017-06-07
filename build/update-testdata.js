var fs = require('fs');
var pg = require('pg');
var async = require('async');
var stringify = require('json-stringify-pretty-compact');

var GeometryFormat = require('./geometryformat');

var geometryFormats = [
    new GeometryFormat('wkt', 'ST_AsText', 'ST_GeomFromText', false),
    new GeometryFormat('ewkt', 'ST_AsEWKT', 'ST_GeomFromEWKT', false, 4326),
    new GeometryFormat('wkb', 'ST_AsBinary', 'ST_GeomFromWKB', true),
    new GeometryFormat('ewkb', 'ST_AsEWKB', 'ST_GeomFromEWKB', true, 4326),
    new GeometryFormat('wkbXdr', 'ST_AsBinary', 'ST_GeomFromWKB', true, null, '\'xdr\''),
    new GeometryFormat('ewkbXdr', 'ST_AsEWKB', 'ST_GeomFromEWKB', true, 4326, '\'xdr\''),
    new GeometryFormat('ewkbNoSrid', 'ST_AsEWKB', 'ST_GeomFromEWKB', true),
    new GeometryFormat('ewkbXdrNoSrid', 'ST_AsEWKB', 'ST_GeomFromEWKB', true, null, '\'xdr\''),
    new GeometryFormat('twkb', 'ST_AsTWKB', 'ST_GeomFromTWKB', true),
    new GeometryFormat('geojson', 'ST_AsGeoJSON', 'ST_GeomFromGeoJSON', false)
];

var testInputData = JSON.parse(fs.readFileSync('./test/tests.input.json', { encoding: 'utf8' }));
var testOutputData = {};

var connectionString = 'postgres://postgres:postgres@localhost/postgres';

var client = new pg.Client(connectionString);
client.connect(function(err) {
    if (err) {
        console.log(err);
        return;
    }

    async.forEachOf(testInputData, function (testDimension, testDimensionKey, dimensionCallback) {
        var dimension = {};        
        testOutputData[testDimensionKey] = dimension;

        async.forEachOf(testDimension, function (testInput, testInputKey, testInputCallback) {
            var testOutput = {};
            var testOutputResult = {};
            dimension[testInputKey] = testOutput;

            async.forEachOf(geometryFormats, function (geometryFormat, geometryFormatKey, 
                            geometryFormatCallback) {
                client.query(geometryFormat.generateSql(), [testInput], function (err, result) {
                    if (err) {
                        testOutput[geometryFormat.name] = null;
                    }
                    else {
                        testOutput[geometryFormat.name] = result.rows[0][geometryFormat.name.toLowerCase()];
                        var wktResult = result.rows[0][geometryFormat.name.toLowerCase() + 'result'];

                        if (testInput != wktResult)
                            testOutputResult[geometryFormat.name] = wktResult;
                    }

                    geometryFormatCallback();
                });
            }, function () {
                if (Object.keys(testOutputResult).length > 0)
                    testOutput.results = testOutputResult;

                testInputCallback();
            });
        }, dimensionCallback);

    }, function () {
        client.end();
        fs.writeFileSync('./test/testdata.json', stringify(testOutputData));
    });
});
