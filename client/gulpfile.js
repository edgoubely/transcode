var gulp = require('gulp'),
	includeSources = require('gulp-include-source'),
	del = require('del'),
	jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	usemin = require('gulp-usemin'),
	uglify = require('gulp-uglify'),
	connect = require('gulp-connect'),
	jshint = require('gulp-jshint'),
	uncss = require('gulp-uncss'),
	minifyCss = require('gulp-minify-css');

gulp.task('default', ['connectDev']);

gulp.task('dist', ['sources', 'assets', 'html', 'connectDist']);


gulp.task('lint', function(){
	gulp.src(['./src/app/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('connectDev', function () {
	connect.server({
    root: ['./src/app'],
    port: 8002,
    livereload: false,
    middleware: function (connect) {
    	return [
    		connect().use(
        	'/bower_components',
        	connect.static('./bower_components')),

        connect().use(
        	'/styles',
        	connect.static('./src/assets/styles')),

        connect().use(
        	'/fonts',
        	connect.static('./src/assets/fonts')),

        connect().use(
        	'/images',
        	connect.static('./src/assets/images'))
    	];
    }
	});
});

gulp.task('connectDist', function () {
  connect.server({
    root: 'dist',
    port: 8001,
    livereload: false
  });
});

gulp.task('sources', ['clean'], function(){
	gulp.src('./src/app/index.html')
		.pipe( usemin({
			lib1: [], lib2: [uglify], main: [uglify] 
    	}))
    .pipe( gulp.dest('dist/') );
});

gulp.task('assets', ['clean'], function(){
	gulp.src('./src/assets/**/*')
		.pipe(gulp.dest('dist/'));
});

gulp.task('html', ['clean'], function() {
	gulp.src(['./src/app/**/*.html', '!./src/app/index.html', './src/app/favicon.ico'])
		.pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
	del.sync(['dist/**']);
});

gulp.task('css', function() {
	gulp.src('./src/assets/styles/*.css')
		.pipe(uncss({
			html: ['./src/app/**/*.html']
		}))
		.pipe(concat('main.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest('./dist/test'));
});

gulp.task('watch', function() {
  gulp.watch('./src/app/**/*.js', ['lint']);
});