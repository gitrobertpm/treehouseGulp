"use strict";

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    maps = require("gulp-sourcemaps"),
    imagemin = require("gulp-imagemin"),
    del = require("del");
    
gulp.task("clean", function () {
	return del(["dist", "css", "js/app.js", "js/app.min.js", "js/app.js.map"]);
});

gulp.task("concatScripts", function() {
	return gulp.src(["js/circle/autogrow.js", 
				"js/circle/circle.js",
				"js/global.js"])
		.pipe(maps.init())
		.pipe(concat("app.js"))
		.pipe(maps.write("./"))
		.pipe(gulp.dest("js"));
});

gulp.task("minifyScripts", ["concatScripts"], function() {
	return gulp.src("js/app.js")
		.pipe(uglify())
		.pipe(rename("all.min.js"))
		.pipe(gulp.dest("js"));
});

gulp.task("buildJS", ["minifyScripts"], function() {
	return gulp.src(["js/all.min.js"], {base: "./"})
				.pipe(gulp.dest("dist"));
});

gulp.task("scripts", ["buildJS"]);


gulp.task("compileSass", function() {
	return gulp.src(["sass/global.scss"])
		.pipe(maps.init())
		.pipe(sass({outputStyle: "compressed"}))
		.pipe(rename("all.min.css"))
		.pipe(maps.write("./"))
		.pipe(gulp.dest("css"));
});

gulp.task("buildCSS", ["compileSass"], function() {
	return gulp.src(["css/all.min.css"], {base: "./"})
				.pipe(gulp.dest("dist"));
});

gulp.task("styles", ["buildCSS"]);

gulp.task("images", function() {
	return gulp.src("images/*")
		.pipe(imagemin())
		.pipe(gulp.dest("dist/content"));
});

gulp.task("watchFiles", function() {
	gulp.watch(["sass/*.scss", "sass/**/*.scss"], ["styles"]);
	gulp.watch(["js/*.js", "js/circle/*.js"], ["scripts"]);
});

gulp.task("serve", ["watchFiles"]);

gulp.task("build", ["scripts", "styles", "images"], function() {
	return gulp.src(["index.html"], {base: "./"})
				.pipe(gulp.dest("dist"));
});

gulp.task("default", ["clean"], function() {
	gulp.start("build");
});

