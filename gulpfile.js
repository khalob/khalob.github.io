"use strict";

var gulp             = require('gulp'),
    gulpSass         = require('gulp-sass'),
    cleanCSS         = require('gulp-clean-css'),
    uglify           = require('gulp-uglify-es').default,
    gulpAutoprefixer = require('gulp-autoprefixer'),
    source           = require('vinyl-source-stream'),
    browserify       = require('browserify'),
	rename           = require('gulp-rename'),
    es2015           = require('babel-preset-es2015'),
	mergeStream      = require('merge-stream'),
	glob             = require('glob'),
	del              = require('del'),
	path             = require('path'),
    runSequence      = require('gulp4-run-sequence'),
    babelify         = require('babelify').configure({
        presets: [es2015],
        compact: true,
        sourceMaps: true
    });

/* JavaScript paths */
var JS_PATHS = [
    {
        "wtc"    : "assets/source/js/*.js",
        "src"    : "assets/source/js/*.js",
        "dst"    : "assets/source/tempjs/",
		"min"    : {
			"src" : "assets/source/tempjs/*.js",
			"dst" : "assets/js"
		}
    }
];

/* SCSS paths */
var SCSS_PATHS = [
    {
        "wtc" : "assets/source/scss/*.scss",
        "src" : "assets/source/scss/*.scss",
        "dst" : "assets/source/tempcss/",
		"css" : {
			"src" : "assets/source/tempcss/*.css",
			"dst" : "assets/css"
		}
    }
];

// JS watch function
const watchJS = (done) => {
    JS_PATHS.forEach(p => {
        gulp.watch(p.wtc, gulp.series("js", "optimizeJS", "cleanJS"));
    });

    done();
};

// CSS watch function
const watchSCSS = (done) => {
    SCSS_PATHS.forEach(p => {
        gulp.watch(p.wtc, gulp.series("scss", "optimizeCSS", "cleanCSS"));
    });

    done();
};

// JS optimization function
gulp.task("optimizeJS", () => {
	var streams = mergeStream();
    JS_PATHS.forEach(p => {
		streams.add(
			gulp.src(p.min.src)
			.pipe(uglify())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest(p.min.dst))
		);
    });
	
	return streams;
});

// Deletes temporary JS files
gulp.task("cleanJS", (done) => {
    JS_PATHS.forEach(p => {
		del.sync(p.dst);
    });
	return done();
});

// Deletes temporary CSS files
gulp.task("cleanCSS", (done) => {
    SCSS_PATHS.forEach(p => {
		del.sync(p.dst);
    });
	return done();
});

// CSS optimization function
gulp.task("optimizeCSS", () => {
	var streams = mergeStream();
    SCSS_PATHS.forEach(p => {
		streams.add(
			gulp.src(p.css.src)
			.pipe(cleanCSS())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest(p.css.dst))
		);
    });
	
	return streams;
});

gulp.task("js", () => {
	var streams = mergeStream();
    JS_PATHS.forEach(p => {
		var files = glob.sync(p.src);

		files.map(function(file) {	
			streams.add(
				browserify({
					entries: file,
					cache: {},
					packageCache: {},
					debug: true
				})
				// .transform(babelify)
				.bundle()
				.pipe(source(path.basename(file, '.js') + '.js'))
				.pipe(gulp.dest(p.dst))
			);
		});
    });
	
	
	return streams;
});

gulp.task("scss", () => {
	var streams = mergeStream();
    SCSS_PATHS.forEach(p => {
		streams.add(
			gulp.src(p.src)
			.pipe(gulpSass({
					errLogToConsole: true,
					sourceComments: false
				})
			)
			.pipe(gulpAutoprefixer())
			.pipe(gulp.dest(p.dst))
		);
    });
	
	return streams;
});

// Watcher
gulp.task("watch", gulp.series("scss", "js", "optimizeJS", "optimizeCSS", "cleanJS", "cleanCSS", gulp.parallel(watchSCSS, watchJS)));
