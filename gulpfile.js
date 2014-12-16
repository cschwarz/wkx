var Readable = require('stream').Readable;

var browserify  = require('browserify');
var File = require('vinyl');
var gulp = require('gulp');
var gUtil = require('gulp-util');
var pathmap = require('gulp-pathmap');
var uglify = require('gulp-uglify');


var debug = gUtil.env.debug;
if(debug) {
    gUtil.log(gUtil.colors.yellow('Enabling source maps.'));
}


gulp.task('default', function() {
    var bundler = browserify({ debug: debug })
        .require('buffer')
        .require('./lib/wkx.js', { expose: 'wkx' });

    var bundleStream = new Readable({ objectMode: true });

    bundleStream._read = function() {
        if(bundleStream.readCalled) { return; }
        bundleStream.readCalled = true;

        bundler.bundle(function(err, buf) {
            if(err) {
                bundleStream.emit('error', err);
            } else {
                // Push a vinyl file of the bundle.
                bundleStream.push(new File({
                    path: debug ? 'wkx-debug.js' : 'wkx.js',
                    contents: buf
                }));

                // End the stream.
                bundleStream.push(null);
            }
        });
    };

    return bundleStream
        // Write non-minified version.
        .pipe(gulp.dest('./dist'))

        // Write minified version.
        .pipe(uglify())
        .pipe(pathmap('%X.min.js'))
        .pipe(gulp.dest('./dist'));
});
