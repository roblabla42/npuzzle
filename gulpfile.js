var gulp       = require('gulp');
var plumber    = require("gulp-plumber");
var babel      = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var gutil      = require('gulp-util');

var options = {
  optional: ["asyncToGenerator"],
  stage: 0 // Dat ES7 goodness
};


gulp.task('compile', function() {
    gulp
        .src('src/**/*.js')
        .pipe(plumber({
          errorHandler: function(err) {
            console.log(err.toString());
            if (err.codeFrame)
              console.log(err.codeFrame);
            this.emit('end');
          }
        }))
        .pipe(sourcemaps.init())
        .pipe(babel(options))
        .pipe(plumber.stop())
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['compile']);
});

gulp.task('default', ['compile']);
