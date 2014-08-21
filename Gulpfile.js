var pkg = require("./package.json"),
	gulp = require("gulp"),
	rimraf = require("gulp-rimraf"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	moment = require("moment"),
	sass = require("gulp-sass"),
	minifyCss = require("gulp-minify-css"),
	ngAnnotate = require("gulp-ng-annotate");
	uglify = require("gulp-uglify"),
	express = require("express"),
	livereload = require("gulp-livereload");


gulp.task("clean-build", function () {

	return gulp.src("./build/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-build-scripts", function () {

	return gulp.src("./build/scripts/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-build-styles", function () {

	return gulp.src("./build/styles/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-build-views", function () {

	return gulp.src("./build/views/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-build-index", function () {

	return gulp.src("./build/index.html", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-dist", function () {

	return gulp.src("./dist/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean", ["clean-build", "clean-dist"]);

gulp.task("build-libs", function () {

	return gulp.src([
		"./bower_components/angular/angular.js"
	])
		.pipe(concat("libs.js"))
		.pipe(gulp.dest("./temp/"));

});

gulp.task("build-app-scripts", function () {

	return gulp.src([
		"./src/scripts/**/*.js"
	])
		.pipe(ngAnnotate())
		.pipe(concat("app.js"))
		.pipe(gulp.dest("./temp/"));

});

gulp.task("build-scripts", ["clean-build-scripts", "build-libs", "build-app-scripts"], function () {

	return gulp.src([
		"./temp/libs.js",
		"./temp/app.js"
	])
		.pipe(concat("app.js"))
		.pipe(header([
			"/**",
			" * ${pkg.name} v${pkg.version}",
			" * " + moment().format("MMDDYYYY hh:mm:ss A X"),
			" */",
			"", "",
		].join("\n"), {pkg: pkg}))
		.pipe(gulp.dest("./build/scripts/"));

});

gulp.task("build-styles", ["clean-build-styles"], function () {

	return gulp.src("./src/styles/app.scss")
		.pipe(sass({
			outputStyle: "nested"
		}))
		.pipe(header([
			"/**",
			" * ${pkg.name} v${pkg.version}",
			" * " + moment().format("MMDDYYYY hh:mm:ss A X"),
			" */",
			"", "",
		].join("\n"), {pkg: pkg}))
		.pipe(gulp.dest("./build/styles/"));

});

gulp.task("copy-index-build", ["clean-build-index"], function () {

	return gulp.src("./src/index.html")
		.pipe(gulp.dest("./build/"));

});

gulp.task("copy-views-build", ["clean-build-views"], function () {

	return gulp.src("./src/views/**/*")
		.pipe(gulp.dest("./build/views/"));

});

gulp.task("copy-build", ["copy-index-build", "copy-views-build"]);

gulp.task("build", ["build-scripts", "build-styles", "copy-build"], function () {

	return gulp.src("./temp/")
		.pipe(rimraf());

});

gulp.task("test", ["build"], function () {

});

gulp.task("minify-scripts", ["clean-dist", "build"], function () {

	return gulp.src("./build/scripts/app.js")
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(gulp.dest("./dist/scripts/"));

});

gulp.task("minify-styles", ["clean-dist", "build"], function () {

	return gulp.src("./build/styles/app.css")
		.pipe(minifyCss())
		.pipe(gulp.dest("./dist/styles/"));

});

gulp.task("minify", ["minify-scripts", "minify-styles"]);

gulp.task("copy-index-dist", ["clean-dist", "build"], function () {

	return gulp.src("./build/index.html")
		.pipe(gulp.dest("./dist/"));

});

gulp.task("copy-views-dist", ["clean-dist", "build"], function () {

	return gulp.src("./build/views/**/*")
		.pipe(gulp.dest("./dist/views/"));

});

gulp.task("copy-dist", ["copy-index-dist", "copy-views-dist"]);

gulp.task("dist", ["minify", "copy-dist"]);

gulp.task("run-build", function () {

	var app = express();
	app.use(express.static(__dirname + "/build"));
	app.listen(29017);

});

gulp.task("run", function () {

	var app = express();
	app.use(express.static(__dirname = "/dist"));
	app.listen(29017);

});

gulp.task("watch", ["build"], function () {

	livereload.listen();
	gulp.watch("./src/scripts/**/*.js", ["build-scripts"]);
	gulp.watch("./src/styles/**/*.scss", ["build-styles"]);
	gulp.watch("./src/**/*.html", ["copy-index-build", "copy-views-build"]);
	gulp.on("stop", function () {
		livereload.changed();
	});

});

gulp.task("default", ["build", "test", "dist"]);
