const   {task, watch, src, dest, parallel, series} = require('gulp'),
        browserSync = require('browser-sync'),
        sass = require('gulp-sass'),
        uglify = require('gulp-uglify'),
        babel = require('gulp-babel'),
        fileinclude = require('gulp-file-include'),
        prefixer = require('gulp-autoprefixer'),
        imagemin = require('gulp-imagemin'),
        sourcemaps = require('gulp-sourcemaps'),
        cssnano = require('gulp-cssnano'),
        rimraf = require('rimraf'),
        rename = require('gulp-rename'),
        stream = browserSync.stream
        
const   webpack = require('webpack-stream');

let mode = 'development'

//----------------------------------- Path ----------------------------//


const  path = {
    build: {
        html: 'build/',
        css: 'build/css',
        img: 'build/img',
        js: 'build/js',
        fonts: 'build/fonts',
    },
    src: {
        html: 'src/*.html',
        css: 'src/css/*.css',
        sass: 'src/sass/*.sass',
        img: 'src/img/**',
        js: 'src/js/index.js',
        jsLib: 'src/js-lib/*.js',
        fonts: 'src/fonts/**'
    },
    watch: {
        html: 'src/**/*.html',
        php: './**/*.php',
        sass: 'src/sass/**',
        js: 'src/js/**',
        img: 'src/img/**',
        fonts: 'src/fonts/**'
    },
    clean: './build'
};


//----------------------------------- Html ----------------------------//

const html = function() {
    return src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(path.build.html))
        .pipe(stream())
};

//----------------------------------- Style ----------------------------//

const css = function() {
    return src(path.src.css) 
        .pipe(dest(path.build.css))
        .pipe(stream());
}

const styles = function () {
    return src(path.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer()) 
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(stream());
};

const styles_without_min = function (){
    return src(path.src.sass)
    .pipe(sass())
    .pipe(prefixer())
    .pipe(dest(path.build.css))
}

//----------------------------------- Fonts ----------------------------//

const fonts = function() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(stream());
};

//----------------------------------- JS ----------------------------//

const lib_scripts = function() {
    return src(path.src.jsLib) 
        .pipe(uglify()) 
        .pipe(rename({suffix: '.min'})) 
        .pipe(dest(path.build.js))
        .pipe(stream());
}
const main_scripts = function() {
    return src(path.src.js) 
        .pipe(sourcemaps.init())
        .pipe(webpack({
            mode: mode,
            output: {
                filename: 'app.js',
              },
              module: {
                rules: [
                  {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    exclude: ["transform-regenerator"]
                                },
                            ]
                        ],
                      }
                    }
                  }
                ]
              }
        }))
        .pipe(uglify()) 
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.js))
        .pipe(stream());
}

const scripts = parallel( main_scripts , lib_scripts )

const scripts_without_min = function () {
    return src(path.src.js) 
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js))
};

//----------------------------------- Image ----------------------------//

const image = function () {
    return src(path.src.img) 
        .pipe(imagemin())
        .pipe(dest(path.build.img))
        .pipe(stream());
};

//----------------------------------- Serve ----------------------------//

const build = parallel(html, css, styles, fonts, scripts, image)

const without_min = parallel(styles_without_min, scripts_without_min)

const webserver = function() {
    return browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
};

const all_watch = () => {
    watch(path.watch.html, html);
    watch(path.watch.sass, styles);
    watch(path.watch.fonts, fonts);
    watch(path.watch.js, scripts);
    watch(path.watch.img, image);
}

const clean = function (done) {
    rimraf(path.clean, done);
};

//----------------------------------- Exports ----------------------------//

exports.clean = clean

exports.build = series( ()=>{mode = 'production'}, clean, build, without_min)

exports.default = series(build, parallel(webserver, all_watch)) 