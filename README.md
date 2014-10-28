wkx
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

The following examples show you how to work with wkx.

```javascript
var wkx = require('wkx');

//Parsing a WKT string
var geometry = wkx.Geometry.parse('POINT(1 2)');

//Parsing a node Buffer containing a WKB object
var geometry = wkx.Geometry.parse(wkbBuffer);

//Serializing a Point geometry to WKT
var wktString = new wkx.Point(1, 2).toWkt();

//Serializing a Point geometry to WKB
var wkbBuffer = new wkx.Point(1, 2).toWkb();
```

Browser
-------

To use wkx in the browser, install [browserify][] (`npm install -g browserify`) and use it:
```bash
mkdir -p browser
browserify -r buffer -r ./lib/wkx.js:wkx -o browser/wkx.js
```

Then, simply include the built wkx.js...
```html
<script src="wkx.js"></script>
```

...and use it from your own scripts:
```javascript
var wkx = require('wkx');

var geometry = wkx.Geometry.parse('POINT(1 2)');

document.getElementById('output').innerText = JSON.stringify(geometry, null, '  ');
```


For development and debugging, you can use [exorcist][] (`npm install -g exorcist`) to extract the source map:
```bash
browserify -r buffer -r ./lib/wkx.js:wkx --debug | exorcist browser/wkx.js.map > browser/wkx.js
```

[browserify]: http://browserify.org/
[exorcist]: https://www.npmjs.org/package/exorcist

Todo
----

- Add support for parsing and serializing 3D/4D geometries (Z, M and ZM)
