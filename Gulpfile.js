var pkg = require("./package.json"),
	gulp = require("gulp"),
	rimraf = require("gulp-rimraf"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	moment = require("moment"),
	less = require("gulp-less"),
	minifyCss = require("gulp-minify-css"),
	ngAnnotate = require("gulp-ng-annotate");
	uglify = require("gulp-uglify"),
	express = require("express"),
	livereload = require("gulp-livereload");


gulp.task("clean", function () {

	return gulp.src([
		"./build/",
		"./dist/",
		"./temp-scripts/"
	], { read: false })
		.pipe(rimraf());

});

gulp.task("clean-scripts", function () {

	return gulp.src([
		"./build/scripts/",
		"./temp-scripts/"
	], { read: false })
		.pipe(rimraf());

});

gulp.task("clean-styles", function () {

	return gulp.src([
		"./build/styles/"
	], { read: false })
		.pipe(rimraf());

});

gulp.task("clean-views", function () {

	return gulp.src("./build/views/", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-index", function () {

	return gulp.src("./build/index.html", { read: false })
		.pipe(rimraf());

});

gulp.task("clean-dist", function () {

	return gulp.src("./dist/").pipe(rimraf());

})

gulp.task("lib-scripts", ["clean-scripts"], function () {

	return gulp.src([
		"./bower_components/angular/angular.js"
	])
		.pipe(concat("libs.js"))
		.pipe(gulp.dest("./temp-scripts/"));

});

gulp.task("app-scripts", ["clean-scripts"], function () {

	return gulp.src([
		"./src/scripts/**/*.js"
	])
		.pipe(ngAnnotate())
		.pipe(concat("app.js"))
		.pipe(gulp.dest("./temp-scripts/"));

});

gulp.task("scripts", ["clean-scripts", "lib-scripts", "app-scripts"], function () {

	gulp.src([
		"./temp-scripts/libs.js",
		"./temp-scripts/app.js"
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

gulp.task("styles", ["clean-styles"], function () {

	return gulp.src([
		"./bower_components/normalize-css/normalize.css",
		"./src/styles/app.less"
	])
		.pipe(concat("app.less"))
		.pipe(less())
		.pipe(header([
			"/**",
			" * ${pkg.name} v${pkg.version}",
			" * " + moment().format("MMDDYYYY hh:mm:ss A X"),
			" */",
			"", "",
		].join("\n"), {pkg: pkg}))
		.pipe(gulp.dest("./build/styles/"));

});

gulp.task("index", ["clean-index"], function () {

	return gulp.src("./src/index.html")
		.pipe(gulp.dest("./build/"));

});

gulp.task("views", ["clean-views"], function () {

	return gulp.src("./src/views/**/*")
		.pipe(gulp.dest("./build/views/"));

});

gulp.task("build", ["scripts", "styles", "views", "index"]);

gulp.task("package-scripts", ["clean-dist"], function () {

	return gulp.src("./build/scripts/app.js")
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(gulp.dest("./dist/scripts/"));

});

gulp.task("package-styles", ["clean-dist"], function () {

	return gulp.src("./build/styles/app.css")
		.pipe(minifyCss())
		.pipe(gulp.dest("./dist/styles/"));

});

gulp.task("package-index", ["clean-dist"], function () {

	return gulp.src("./build/index.html")
		.pipe(gulp.dest("./dist/"));

});

gulp.task("package-views", ["clean-dist"], function () {

	return gulp.src("./build/views/**/*")
		.pipe(gulp.dest("./dist/views/"));

});

gulp.task("package", ["package-scripts", "package-styles", "package-index", "package-views"]);

gulp.task("run", function () {

	var app = express();
	app.use(express.static(__dirname + "/build"));
	app.listen(29017);
	console.log("Server running on localhost:29017");

});

gulp.task("watch", ["build"], function () {

	livereload.listen();
	gulp.watch("./src/scripts/**/*.js", ["scripts"]);
	gulp.watch("./src/styles/**/*.less", ["styles"]);
	gulp.watch("./src/**/*.html", ["index", "views"]);
	gulp.on("stop", function () {
		setTimeout(function () {
			livereload.changed();
		}, 10);
	});

});

gulp.task("default", ["build"]);
