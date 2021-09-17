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
        stream = browserSync.stream,

        webpack = require('webpack'),
        webpackStream = require('webpack-stream'),
        
        config = require('./config.js'),
        webpackConfig = require('./webpack.config.js')

//----------------------------------- Path ----------------------------//

const  path = {
    build: {
        html: `${config.folders.build}/`,
        css: `${config.folders.build}/css`,
        img: `${config.folders.build}/img`,
        js: `${config.folders.build}/js`,
        fonts: `${config.folders.build}/fonts`,
        lib: `${config.folders.build}/lib/**`,
    },
    src: {
        html: `${config.folders.src}/*.html`,
        css: `${config.folders.src}/css/*.css`,
        sass: `${config.folders.src}/sass/*.sass`,
        img: `${config.folders.src}/img/**`,
        js: `${config.folders.src}/js/*.js`,
        lib: `${config.folders.src}/lib/**`,
        fonts: `${config.folders.src}/fonts/**`
    },
    watch: {
        html: `${config.folders.src}/**/*.html`,
        php: `./**/*.php`,
        sass: `${config.folders.src}/sass/**`,
        js: `${config.folders.src}/js/**`,
        lib: `${config.folders.src}/lib/**`,
        img: `${config.folders.src}/img/**`,
        fonts: `${config.folders.src}/fonts/**`
    },
    clean: `./${config.folders.build}`
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

const webpackTask = function(){
    return src('./')
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(dest(path.build.js))
        .pipe(stream());
}

const babel_loader = function() {
    return src(path.src.js) 
        .pipe(babel({
            presets: [
                "@babel/preset-env",
                {
                    exclude: ["transform-regenerator"]
                },
            ]
        }))
        .pipe(uglify()) 
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.js))
        .pipe(stream());
}

const scripts = (config.jsMod == 'webpack') ? webpackTask : babel_loader

const scripts_without_min = function () {
    return src(path.src.js) 
        .pipe(babel({
            presets: [
                "@babel/preset-env",
                {
                    exclude: ["transform-regenerator"]
                },
            ]
        }))
        .pipe(dest(path.build.js))
};

//----------------------------------- libraries ----------------------------//

const libraries = function() {
    return src(path.src.lib) 
        .pipe(dest(path.build.lib))
        .pipe(stream());
}

//----------------------------------- Image ----------------------------//

const image = function () {
    return src(path.src.img) 
        .pipe(imagemin())
        .pipe(dest(path.build.img))
        .pipe(stream());
};

//----------------------------------- Serve ----------------------------//

const build = parallel(html, css, styles, fonts, scripts, image, libraries)

const without_min = parallel(styles_without_min, scripts_without_min)

webserverConfig = (config.serverMod == 'url') ? { proxy: config.serverUrl } : {server: {baseDir: "./build"}}

const webserver = function() {
    return browserSync.init(webserverConfig);
};

const all_watch = () => {
    watch(path.watch.html, html);
    watch(path.watch.sass, styles);
    watch(path.watch.fonts, fonts);
    watch(path.watch.js, scripts);
    watch(path.watch.img, image);
    watch(path.watch.lib, libraries);
}

const clean = function (done) {
    rimraf(path.clean, done);
};

//----------------------------------- Exports ----------------------------//

exports.clean = clean

exports.build = series( ()=>{config.mode = 'production'}, clean, build, without_min)

exports.webpack = webpackTask

exports.default = series(build, parallel(webserver, all_watch)) 
