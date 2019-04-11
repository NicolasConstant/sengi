// Sass configuration
var gulp = require('gulp');
var run = require('gulp-run');

gulp.task('npmsass', function () {
    // setTimeout(function () {
        run('npm start').exec();
    // }, 300);
});

gulp.task('default', ['npmsass'], function () {
    gulp.watch('./assets/sass/**/*.scss', ['npmsass']);
})