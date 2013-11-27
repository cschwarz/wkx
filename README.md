node-wkx
========

A WKT/WKB parser and serializer with support for

- Point
- LineString
- Polygon
- MultiPoint
- MultiLineString
- MultiPolygon
- GeometryCollection

Examples
--------

The following examples show you how to work with node-wkx.

```javascript
var wkx = require('node-wkx');

//Parsing a WKT string
var geometry = wkx.Geometry.parse('POINT(1 2)');

//Parsing a node Buffer containing a WKB object
var geometry = wkx.Geometry.parse(wkbBuffer);

//Serializing a Point geometry to WKT
var wktString = new wkx.Point(1, 2).toWkt();

//Serializing a Point geometry to WKB
var wkbBuffer = new wkx.Point(1, 2).toWkb();
```

Todo
----

- Add support for parsing and serializing 3D/4D geometries (Z, M and ZM)
