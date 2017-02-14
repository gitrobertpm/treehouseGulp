"use strict";

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    eslint = require("gulp-eslint"),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    maps = require("gulp-sourcemaps"),
    imagemin = require("gulp-imagemin"),
    useref = require("gulp-useref"),
    gulpif = require("gulp-if"),
    csso = require("gulp-csso"),
    del = require("del"),
    browserSync = require('browser-sync').create();
    
var options = {
	src: "src",
	dist: "dist",
	dep: "dep"
}


/*************************************************************
* Watching and Browser-syncing
*************************************************************/
gulp.task("serve", ["styles"], function() {
	browserSync.init({
	   server: {
		  baseDir: "./dep/"
	   }
	});
	
	gulp.watch(["src/js/*.js", "src/js/**/*.js"], ["js-watch"]);
	gulp.watch([options.src + "/sass/*.scss", options.src + "/sass/**/*.sass", options.src + "/sass/**/**/*.sass"], ["styles"]);
	gulp.watch("src/*.html").on("change", browserSync.reload);
});


gulp.task("watch", function() {
	gulp.watch([options.src + "/sass/*.scss", options.src + "/sass/**/*.sass", options.src + "/sass/**/**/*.sass"], ["styles"]);
	gulp.watch([options.src + "/js/*.js", options.src + "/js/circle/*.js"], ["scripts"]);
});
/*************************************************************/



/*************************************************************
* Cleaning
*************************************************************/
gulp.task("cleanJS", function () {
	return del(["dist/js", "dep/js"]);
});

gulp.task("cleanCSS", function () {
	return del(["dist/css", "dep/css", "src/css"]);
});

gulp.task("cleanImages", function () {
	return del(["dist/images", "dep/images"]);
});

gulp.task("clean", function () {
	return del(["dist", "dep"]);
});
/*************************************************************/


/*************************************************************
* JavaScript Linting, Concatinating, Minifying, Relocating 
* and setting up Browsersync to watch JS src files
*************************************************************/
gulp.task("lint", function() {
	return gulp.src([options.src + "/js/circle/autogrow.js", 
				options.src + "/js/circle/circle.js",
				options.src + "/js/global.js"])
			.pipe(eslint({
				"rules": {
					"curly": "error",
					"semi": 0,
					"quotes": 0
					}
				}
			))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
});

gulp.task("scripts", ["cleanJS", "lint"], function() {
	return gulp.src([options.src + "/js/circle/autogrow.js", 
				options.src + "/js/circle/circle.js",
				options.src + "/js/global.js"])
			.pipe(maps.init())
			.pipe(concat("all.min.js"))
			.pipe(uglify())
			.pipe(maps.write("./"))
			.pipe(gulp.dest("dist/js"))
			.pipe(gulp.dest("dep/js"));
});

gulp.task("js-watch", ["scripts"], function (done) {
    browserSync.reload();
    done();
});
/*************************************************************/



/*************************************************************
* CSS Concatinating, Minifying, Relocating 
* and setting up Browsersync to watch Sass src files
*************************************************************/
gulp.task("styles", ["cleanCSS"], function() {
	return gulp.src([options.src + "/sass/global.scss"])
			.pipe(maps.init())
			.pipe(sass({outputStyle: "compressed"}))
			.pipe(maps.write("./"))
			.pipe(gulp.dest("src/css"))
			.pipe(rename("all.min.css"))
			.pipe(maps.write("./"))
			.pipe(gulp.dest("dist/css"))
			.pipe(gulp.dest("dep/css"))
			.pipe(browserSync.stream());
});
/*************************************************************/



/*************************************************************
* Image zip and relocate
*************************************************************/
gulp.task("images", ["cleanImages"], function() {
	return gulp.src(options.src + "/images/*")
			.pipe(imagemin())
			.pipe(gulp.dest("dist/content"))
			.pipe(gulp.dest("dep/images"));
});
/*************************************************************/


/*************************************************************
* Renaming CSS and JS links and relocating HTMl 
*************************************************************/
gulp.task("html", ["styles"], function() {
	return gulp.src(options.src + "/index.html")
			.pipe(useref())
			.pipe(gulpif(["*.js", "**/*.js"], uglify()))
			.pipe(gulpif(["*.css"], csso()))
			.pipe(gulp.dest(options.dist))
			.pipe(gulp.dest(options.dep));
});
/*************************************************************/


gulp.task("preBuild", ["clean"], function() {
	gulp.start("scripts", "styles", "images");
});


gulp.task("build", ["preBuild"], function() {
	return gulp.src([options.src + "/icons", options.src + "/index.html"], {base: "./src"})
				.pipe(gulp.dest("dist"));
});

gulp.task("default", ["build"], function() {
	gulp.start("html");
});

