'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var settings = require('./config');
var inject = require('gulp-inject-string');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

// fetch command line arguments
const arg = (argList => {

  let arg = {},
    a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a++) {

    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {

      // argument value
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;

    } else {

      // argument name
      curOpt = opt;
      arg[curOpt] = true;

    }

  }

  return arg;

})(process.argv);

gulp.task('partials', function() {
  return gulp.src([
      path.join(conf.paths.src, '/app/**/*.html'),
      path.join(conf.paths.tmp, '/serve/app/**/*.html')
    ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'GasNinjasAdmin',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function() {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true });
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });
  var assets;

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.sourcemaps.init())
    .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
    .pipe($.minifyCss({ processImport: false }))
    .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function() {
  return gulp.src($.mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', ['copyVendorImages'], function() {
  var fileFilter = $.filter(function(file) {
    return file.stat.isFile();
  });

  return gulp.src([
      path.join(conf.paths.src, '/**/*'),
      path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss,md}'),
      path.join(conf.paths.tmp, '/serve/**/assets/img/theme/vendor/**/*')
    ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('clean', function() {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['html', 'fonts', 'other']);

gulp.task('changeDist:production', function() {
  console.log('------------------------DESTINATION FOLDER----------------------');
  console.log(settings.dist);
  console.log('----------------------------------------------------------------');
  conf.paths.dist = settings.dist;
});

gulp.task('production', ['changeDist:production', 'build'], function() {
  console.log('------------------------API SERVER----------------------');
  console.log(settings.apiServer);
  console.log('--------------------------------------------------------');
  return gulp.src([
      conf.paths.dist + '/index.html',
      conf.paths.dist + '/auth.html'
    ])
    .pipe(inject.replace('http://localhost/gn_api', settings.apiServer))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});