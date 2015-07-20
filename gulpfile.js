var gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	del = require('del'),
	log = console.log.bind(console),
	runSequence = require('run-sequence'),
	jshintConfig = require('./jshintConfig.json'),
	jshintStylish = require('jshint-stylish')



gulp.task('js-tmp', function () {
	del.sync('tmp/js');
	return gulp.src(['src/**/*.js', 'demo/**/*.js'])
		.pipe($.jshint(jshintConfig))
		.pipe($.jshint.reporter(jshintStylish))
		.pipe($.jshint.reporter('fail'))
		.pipe($.ngAnnotate())
		.pipe(gulp.dest('tmp/js'))
})

gulp.task('js-dist', function () {
	return gulp.src(['src/**/*.js'])
		.pipe($.jshint(jshintConfig))
		.pipe($.jshint.reporter(jshintStylish))
		.pipe($.jshint.reporter('fail'))
		.pipe($.ngAnnotate())
		.pipe($.concat('dkModal.js'))
		.pipe(gulp.dest('dist'))
		.pipe($.uglify())
		.pipe($.extReplace('.min.js'))
		.pipe(gulp.dest('dist'))
})

gulp.task('copy-less-dist', function() {
	return gulp.src('src/dkModal.less')
		.pipe(gulp.dest('dist'))
});

gulp.task('less-tmp', function () {
	del.sync('tmp/css');
	return gulp.src(['src/**/*.less', 'demo/**/*.less'])
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
		.pipe(gulp.dest('tmp/css'))
});

gulp.task('less-dist', function () {
	return gulp.src(['src/**/*.less'])
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
		.pipe($.concat('dkModal.css'))
		.pipe(gulp.dest('dist'))
		.pipe($.csso())
		.pipe($.extReplace('.min.css'))
		.pipe(gulp.dest('dist'))
});

///////////////////// dist

gulp.task('clean-dist', function (cb) {
	del('dist', cb)
});

gulp.task('build-tmp', ['js-tmp', 'less-tmp'])

gulp.task('build-dist', ['clean-dist'], function(cb) {
	runSequence(['js-dist', 'copy-less-dist', 'less-dist'], cb)
});

//////////////////// watch

gulp.task('watch', ['js-tmp', 'less-tmp'], function() {
	gulp.watch(['src/*.js', 'demo/*.js'], ['js-tmp']);
	gulp.watch(['src/*.less', 'demo/*.less'], ['less-tmp']);
})

