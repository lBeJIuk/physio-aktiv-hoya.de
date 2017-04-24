'use strict';

var gulp=  require('gulp');
var less = require('gulp-less');

var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

var notify = require('gulp-notify');
var combiner = require('stream-combiner2').obj;

var rigger = require('gulp-rigger');
var uglify = require('gulp-uglify');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var rimraf = require('rimraf');
var ghPages = require('gulp-gh-pages');

var postcss = require('gulp-postcss');
var mqPacker = require("css-mqpacker");
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var rename = require('gulp-rename');

var path = {
    public: {
      html: 'public/',
        js: 'public/js/',
        css: 'public/css/',
        img: 'public/img/',
        fonts: 'public/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/script.js',
        style: 'src/style/style.less',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
       html: 'src/**/*.html',
       js: 'src/js/**/*.js',
       style: 'src/style/**/*.less',
       img: 'src/img/**/*.*',
       fonts: 'src/fonts/**/*.*'
   },
    clean: './public/'
};



// ******************* Compiling
/*gulp.task('less', function () {
  return combiner(
   gulp.src(path.src.style),
   less(),
   autoPrefixer(),
   gulp.dest(path.public.css),
   cleanCSS(),
   rename({prefix : 'min-'}),
   gulp.dest(path.public.css)).on('error', notify.onError());
});*/

  
gulp.task('less', function () {
  return combiner(
   gulp.src(path.src.style),
   less(),
   postcss([mqPacker,autoprefixer({browsers: ['last 2 versions', '> 2%']})]),
   gulp.dest(path.public.css),
   postcss([cssnano]),
   rename({prefix : 'min-'}),
   gulp.dest(path.public.css)).on('error', notify.onError());
});



gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('html', function () {
    return combiner(
        gulp.src(path.src.html),
        rigger(),
        gulp.dest(path.public.html)).on('error', notify.onError());
});

gulp.task('js', function () {
  return combiner(
    gulp.src(path.src.js),
        rigger(),
        uglify(),
        gulp.dest(path.public.js)).on('error', notify.onError());
});


gulp.task('img', function () {
    return combiner(
    gulp.src(path.src.img),
        gulp.dest(path.public.img)).on('error', notify.onError());
});

gulp.task('img-optim', function () {
    return combiner(
    gulp.src(path.src.img),
      imagemin({
            progressive: true,
            optimizationLevel:3,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }),
        gulp.dest(path.public.img)).on('error', notify.onError());
});

gulp.task('fonts', function() {
  return combiner(
    gulp.src(path.src.fonts),
        gulp.dest(path.public.fonts)).on('error', notify.onError());
});

// ******************* Compiling




gulp.task('watch' , function(){
  gulp.watch([path.watch.style ], gulp.series('less'));
  gulp.watch([path.watch.html ], gulp.series('html'));
  gulp.watch([path.watch.js ], gulp.series('js'));
  gulp.watch([path.watch.fonts ], gulp.series('fonts'));
  gulp.watch([path.watch.img ], gulp.series('clean','img'));
  gulp.watch([path.public.html , path.public.js, path.public.css, path.public.img, path.public.fonts]).on("change", reload);
});


//*************************** Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public/"
        },
          tunnel: true,
          host: 'localhost',
          port: 9000,
          logPrefix: "lBeJIuk-server"
    });

});
//*************************** Static server

gulp.task('git-host', function() {return gulp.src(path.public.html)
    .pipe(ghPages());
});


gulp.task('dev' , gulp.series('less' ,'html','js', 'fonts', gulp.parallel('watch' , 'browser-sync')));


gulp.task('build' , gulp.series('clean','less' ,'html','js', 'fonts','img-optim', 'browser-sync'));

