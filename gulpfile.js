var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

/* the apg-lib dependencies */
var srcApglibCss = '../apg-lib/apglib.css';
var srcApglibJS = '../apg-lib/apglib.js';

/* input file sources */
var srcApgLess = './dev/css/apg.less';
var destApgCss = './dev/css/apg.css';
var srcApgJS = './dev/js/apgweb.js';
var destApgJS = './dev/js/apghtml.js';

/* production files to concatenate into a single, stand-alone apg.html */
var concatSources = [
  './dev/html/apgweb-top.html',
  srcApglibCss,
  destApgCss,
  './dev/html/toAbout.html',
  './dev/html/about.html',
  './dev/html/toHelp.html',
  './dev/html/help.html',
  './dev/html/toBot.html',
  './dev/js/apghtml.js',
  './dev/html/apgweb-bot.html'
  ];

/* development files to concatenate to apg.html which loads .css and .js files */
var srcHtml = [
  './dev/html/apgweb-top.html',
  './dev/html/toAbout.html',
  './dev/html/about.html',
  './dev/html/toHelp.html',
  './dev/html/help.html',
  './dev/html/toBot.html',
  './dev/html/apgweb-bot.html'
  ];

/* generate apg.css from LESS files */
gulp.task('build:css', function() {
  var stream = gulp.src(srcApgLess)
  .pipe(less())
  .on('error', gutil.log)
  .pipe(rename('apg.css'))
  .pipe(gulp.dest("./dev/css"));
  return stream;
});

/* browserify everything into a single apgweb.js file */
gulp.task('build:js', ['build:css'], function() {
  var stream = gulp.src(srcApgJS)
  .pipe(browserify())
  .on('error', gutil.log)
  .pipe(rename('apghtml.js'))
  .pipe(gulp.dest("./dev/js"));
  return stream;
});

/* concatenate individual file parts into a single apg.html file */
gulp.task('build:html', ['build:js'], function() {
  var stream = gulp.src(concatSources)
  .pipe(concat('apg.html'))
  .on('error', gutil.log)
  .pipe(gulp.dest('./'));
  return stream;
});

gulp.task('update', ['build:css', 'build:js', 'build:html']);

/* watch sources for automatic updates */
var watchfiles = [
  srcApglibCss,
  srcApglibJS,
  srcApgLess,
  srcApgJS
];
watchfiles = watchfiles.concat(srcHtml);

gulp.task('watch', function(){
  gulp.watch(watchfiles, ['update']);
});

/* update everything */
gulp.task('default', ['update', 'watch']);

