var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    del = require('del'),
    es = require('event-stream'),
    bowerFiles = require('main-bower-files'),
    Q = require('q'),
    argv = require('yargs').argv,
    path = require('path'),
    wiredep = require('wiredep').stream,
    paths = {
      redirects: 'src/_redirects',
      styles: 'src/sass/**/*.scss',
      templates: 'src/templates/**/*.html',
      dest: {
        dev: 'dist.dev',
        prod: 'dist.prod'
      },
      images: 'src/img/**/*.*',
      data: 'src/data/*.json',
      scripts: 'src/js/**/*.js',
      index: 'src/index.html',
      fa_fonts: 'bower_components/font-awesome/fonts/*.*'
    },
    pipes = {},
    env = argv.env ? argv.env : 'dev',
    streamqueue = require('streamqueue');

pipes.moveAssets = function () {
  gulp.src(paths.redirects)
      .pipe(gulp.dest(paths.dest[env]));
  gulp.src(paths.fa_fonts)
      .pipe(gulp.dest(paths.dest[env] + '/fonts'));
  gulp.src(paths.images)
    .pipe(gulp.dest(paths.dest[env] + '/img'));
};

// Shared Utilities
pipes.minifyFileName = function() {  
  return plugins.rename(function (path) {
    path.extname = '.min' + path.extname;
  });
};


// Styles Handling
pipes.buildAppStyles = function () {
  return gulp.src([paths.styles])
    .pipe(wiredep())
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.if(env != 'dev', plugins.cleanCss()))
    .pipe(plugins.if(env != 'dev', pipes.minifyFileName()))
    .pipe(plugins.if(env != 'dev', plugins.sourcemaps.write('../maps')))
    .pipe(gulp.dest(paths.dest[env] + '/css'));
};

// Scripts Handling
pipes.buildVendorScripts = function () {
  return gulp.src(bowerFiles({
      filter: /\.js/,
      overrides: {
        "Sortable": {
          "main": ["Sortable.js", "ng-sortable.js"]
        }
      }
    }))
    .pipe(plugins.if(env != 'dev', plugins.sourcemaps.init()))
    .pipe(plugins.if(env != 'dev', plugins.concat('vendor.min.js')))
    .pipe(plugins.if(env != 'dev', plugins.uglify().on('error', plugins.util.log)))
    .pipe(plugins.if(env != 'dev', plugins.sourcemaps.write('../maps')))
    .pipe(gulp.dest(paths.dest[env] + '/js'));
  };

pipes.buildAppScripts = function () {
  var scripts = gulp.src(paths.scripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
  

  if(env != 'dev') {
    var partials = pipes.validatedPartials()
          .pipe(plugins.htmlhint.failReporter())
          .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
          .pipe(plugins.ngHtml2js({
              moduleName: "axiologue",
              prefix: 'templates/'
          }));

    scripts = streamqueue({ objectMode: true }, partials, scripts)
      .pipe(plugins.angularFilesort());
  }

  return scripts
    .pipe(plugins.if(env != 'dev', plugins.sourcemaps.init()))
    .pipe(plugins.if(env != 'dev', plugins.ngAnnotate()))
    .pipe(plugins.if(env != 'dev', plugins.concat('app.min.js')))
    .pipe(plugins.if(env != 'dev', plugins.uglify().on('error', plugins.util.log)))
    .pipe(plugins.if(env != 'dev', plugins.sourcemaps.write('../maps')))
    .pipe(gulp.dest(paths.dest[env] + '/js'));
};

// Page Handling
pipes.validatedPartials = function() {  
  return gulp.src(paths.templates)
    .pipe(plugins.htmlhint({'doctype-first': false}))
    .pipe(plugins.htmlhint.reporter());
};

pipes.buildTemplatesDev = function () {
  return pipes.validatedPartials()
    .pipe(gulp.dest(paths.dest['dev'] + '/templates'));
};
 
pipes.buildIndex = function () {
  return gulp.src(paths.index)
    .pipe(gulp.dest(paths.dest[env]))
    .pipe(plugins.inject(pipes.buildVendorScripts(), {relative: true, name: 'bower'}))
    .pipe(plugins.inject(pipes.buildAppScripts(), {relative: true}))
    .pipe(plugins.inject(pipes.buildAppStyles(), {relative: true}))
    .pipe(gulp.dest(paths.dest[env]));
};

// Full App
pipes.buildApp = function () {
  pipes.moveAssets();

  if (env == 'dev') {
    pipes.buildTemplatesDev();
  }

  return pipes.buildIndex();
};

// Cleaning 
gulp.task('clean', function () {
  var deferred = Q.defer();
  del(paths.dest[env]).then(function () {
    deferred.resolve();
  });
  return deferred.promise;
});


// Tasks
gulp.task('build', pipes.buildApp);

gulp.task('clean-build', ['clean'], pipes.buildApp);

// clean, build, and watch live changes to the prod environment
gulp.task('watch', ['clean-build'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : env == 'prod' ? 'production' : 'dev'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true, port: 35729, host: '127.0.0.1' });

    // watch pages
    gulp.watch(paths.index, function() {
        return pipes.buildIndex()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.buildAppScripts()
            .pipe(plugins.livereload());
    });

    gulp.watch(paths.templates, function () {
      var templates = env == 'prod' ? pipes.BuildAppScripts() : pipes.buildTemplatesDev();

      return templates.pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.buildAppStyles()
            .pipe(plugins.livereload());
    });
});
