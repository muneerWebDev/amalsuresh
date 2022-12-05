/*
 *
 * custom gulp file made by muneerwebdev(github,email)
 * 
 */

// defining required packages
const gulp = require("gulp"),
  { series, parallel, lastRun } = require("gulp"), // to create sequence of tasks
  debug = require("gulp-debug"), // to debug status
  fileinclude = require("gulp-file-include"), //to concat files(like html)
  sourcemaps = require("gulp-sourcemaps"), // to generate sourcemaps
  sass = require("gulp-sass")(require("sass")), // to dist scss files
  cleancss = require("gulp-clean-css"), // to miniy css files
  browsersync = require("browser-sync").create(), // to create live server
  imagemin = require("gulp-imagemin"), //optimize images
  // below are the packages used to optimize js
  useref = require("gulp-useref"),
  gulpif = require("gulp-if"),
  uglify = require("gulp-uglify");

/*
 * functions for the tasks are defined below
 */

// copy other files & directories
function copyFilesAndFolders() {
  return gulp
    .src(["src/fonts/**/*", "src/webfonts/**/*", "src/media/**/*"], {
      base: "./src/",
    })
    .pipe(gulp.dest("dist/"));
}

//copy raw js files before optimising
function preJsOptimize() {
  return gulp
    .src(["src/js/**/*"], {
      base: "./src/",
    })
    .pipe(gulp.dest("dist/"));
}

// compile and concat all js files
function jsOptimize() {
  return gulp
    .src("dist/*.html")
    .pipe(useref())
    .pipe(gulpif("*.js", uglify()))
    .pipe(gulp.dest("dist/"));
}

// optimize images
function images() {
  return gulp
    .src("src/media/images/**/*.*", { since: lastRun(images) })
    .pipe(imagemin())
    .pipe(debug({ title: "processed image :" }))
    .pipe(gulp.dest("dist/media/images"));
}

// compile scss to css
function style() {
  // scss path
  return (
    gulp
      .src("src/scss/**/*.scss")
      .pipe(sourcemaps.init())
      // pass it thru sass compiler
      .pipe(sass())
      // minify css
      .pipe(cleancss())
      // generate sourcemaps
      .pipe(sourcemaps.write("."))
      // destination path
      .pipe(gulp.dest("dist/css"))
      // stream changes to all browsers
      .pipe(browsersync.reload({ stream: true }))
  );
}

//  HTML file include
function htmlConcat() {
  return gulp
    .src(["src/*.html", "!src/template-parts/**/*.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("dist/"));
}

// live code watch
function watch() {
  browsersync.init({
    server: {
      baseDir: "dist/.",
    },
  });
  gulp.watch("src/scss/**/*.scss", style).on("change", browsersync.reload);
  gulp
    .watch(
      "src/**/*.html",
      series(parallel(htmlConcat, preJsOptimize), jsOptimize)
    )
    .on("change", browsersync.reload);
  gulp
    .watch("src/media/images/**/*.*", images)
    .on("change", browsersync.reload);
  gulp
    .watch(
      "src/js/**/*.js",
      series(parallel(htmlConcat, preJsOptimize), jsOptimize)
    )
    .on("change", browsersync.reload);
}

//user ref
function userRef() {
  return (
    gulp
      .src("dist/*.html")
      .pipe(useref())
      // .pipe(gulpif("*.js", uglify()))
      .pipe(gulp.dest("dist/assets"))
  );
}

/*
 * exporting the above defined functions into tasks
 */

exports.style = style;
exports.watch = watch;
exports.copyFilesAndFolders = copyFilesAndFolders;
exports.images = images;
exports.userRef = userRef;
// the below two should be a series (for smooth working of jsoptimize)
exports.htmlConcat = htmlConcat;
exports.jsOptimize = jsOptimize;
// default gulp task below
exports.default = series(
  parallel(style, htmlConcat, copyFilesAndFolders, preJsOptimize, images),
  jsOptimize
);
