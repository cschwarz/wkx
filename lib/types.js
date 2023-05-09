module.exports = {
    wkt: {
        Point: 'POINT',
        LineString: 'LINESTRING',
        Polygon: 'POLYGON',
        MultiPoint: 'MULTIPOINT',
        MultiLineString: 'MULTILINESTRING',
        MultiPolygon: 'MULTIPOLYGON',
        GeometryCollection: 'GEOMETRYCOLLECTION',
        Tin: 'TIN',
    },
    wkb: {
        Point: 1,
        LineString: 2,
        Polygon: 3,
        MultiPoint: 4,
        MultiLineString: 5,
        MultiPolygon: 6,
        GeometryCollection: 7,
        Tin: 16,
        Triangle: 17,
    },
    geoJSON: {
        Point: 'Point',
        LineString: 'LineString',
        Polygon: 'Polygon',
        MultiPoint: 'MultiPoint',
        MultiLineString: 'MultiLineString',
        MultiPolygon: 'MultiPolygon',
        GeometryCollection: 'GeometryCollection'
    }
};
