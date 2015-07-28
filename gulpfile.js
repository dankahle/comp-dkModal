var gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	del = require('del'),
	log = console.log.bind(console),
	runSequence = require('run-sequence'),
	jshintConfig = require('./jshintConfig.json'),
	jshintStylish = require('jshint-stylish')


gulp.task('js-tmp', function () {
	del.sync('tmp/*.js');
	return gulp.src(['src/dk-modal.js', 'demo/demo.js'])
		.pipe($.jshint(jshintConfig))
		.pipe($.jshint.reporter(jshintStylish))
		.pipe($.jshint.reporter('fail'))
		.pipe($.ngAnnotate())
		.pipe(gulp.dest('tmp'))
})

gulp.task('js-dist', function () {
	return gulp.src(['tmp/dk-modal.js'])
		.pipe(gulp.dest('dist'))
		.pipe($.uglify())
		.pipe($.extReplace('.min.js'))
		.pipe(gulp.dest('dist'))
})
//'bower_components/icomoon/fonts'

gulp.task('copy-fonts-tmp', function() {
	del.sync('tmp/fonts/*.*')
	return gulp.src('icomoon/fonts/*.*')
		.pipe(gulp.dest('tmp/fonts'))
})

gulp.task('copy-tmp', function() {
	del.sync(['tmp/*.html', 'tmp/*.png'])
	return gulp.src(['demo/*.html', 'demo/*.png'])
		.pipe(gulp.dest('tmp'))
})

gulp.task('copy-dist', function() {
	return gulp.src(['src/dk-modal.less'])
		.pipe($.extReplace('._less'))// so webstorm stops compiling it
		.pipe(gulp.dest('dist'))
});

gulp.task('less-tmp', function () {
	del.sync('tmp/*.css');
	return gulp.src(['src/dk-modal.less', 'demo/demo.less'])
		.pipe($.less())
		.pipe($.autoprefixer({
			browsers: [
				"Android 2.3",
				"Android >= 4",
				"Chrome >= 20",
				"Firefox >= 24",
				"Explorer >= 8",
				"iOS >= 6",
				"Opera >= 12",
				"Safari >= 6"
			]
		}))
		.pipe(gulp.dest('tmp'))
});

gulp.task('css-dist', function () {
	return gulp.src(['tmp/dk-modal.css'])
		.pipe(gulp.dest('dist'))
		.pipe($.csso())
		.pipe($.extReplace('.min.css'))
		.pipe(gulp.dest('dist'))
});

gulp.task('copy-ghpages', function() {
	return gulp.src(['tmp/*.js', 'tmp/*.css', 'tmp/*.png', 'tmp/tempModal.html'])
		.pipe(gulp.dest('gh-pages'))
})

gulp.task('copy-fonts-ghpages', function() {
	return gulp.src('icomoon/fonts/*.*')
		.pipe(gulp.dest('gh-pages/fonts'))
})

gulp.task('html-ghpages', function () {
	var assets = $.useref.assets();

	return gulp.src('tmp/index.html')
		.pipe(assets)
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.csso()))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe(gulp.dest('gh-pages'));
});

///////////////////// build

gulp.task('build-tmp', function(cb) {
	del.sync('tmp/*.*');
	runSequence(['js-tmp', 'less-tmp', 'copy-tmp'], cb);
})

gulp.task('build-dist', ['build-tmp'], function(cb) {
	del.sync('dist/*.*');
	runSequence(['js-dist', 'css-dist', 'copy-dist'], cb)
});

gulp.task('build-ghpages', ['build-tmp'], function() {
	del.sync('gh-pages/*.*');
	runSequence(['copy-ghpages', 'copy-fonts-ghpages', 'html-ghpages'])
})

//////////////////// watch

gulp.task('watch', ['build-tmp'], function() {
	gulp.watch(['src/*.js', 'demo/*.js'], ['js-tmp']);
	gulp.watch(['src/*.less', 'demo/*.less'], ['less-tmp']);
	gulp.watch(['demo/*.html', 'demo/*.png'], ['copy-tmp']);
})

