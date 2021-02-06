/*
 * This software Copyright by the RPTools.net development team, and
 * licensed under the Affero GPL Version 3 or, at your option, any later
 * version.
 *
 * MapTool Source Code is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public
 * License * along with this source Code.  If not, please visit
 * <http://www.gnu.org/licenses/> and specifically the Affero license
 * text at <http://www.gnu.org/licenses/agpl.html>.
 */

'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const gulpTypedoc = require('gulp-typedoc');
const ts = require('gulp-typescript');
const gulp = require('gulp');
const del = require('del');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const sass = require('gulp-sass');
const runElectron = require('gulp-run-electron');
const nodemon = require('nodemon');

const tsProject = ts.createProject('tsconfig.json');

sass.compiler = require('node-sass');

const DIST_GLOB = './dist/**';
const GENERATED_DOCS_GLOB = './docs/generated/**';
const SERVER_TYPESCRIPT_GLOB = 'server/**/*.ts';
const SERVER_GLOB = 'server/**';
const SERVER_EXCLUDE_TRANSPILED_GLOB = '!server/**/*.{ts,scss}';
const SERVER_TYPEDOC_GLOB = 'server/**/*.{js,ts}';
const SERVER_SOURCE_GLOB = 'server/**/*.{js,ts,tsx,scss}';
const SERVER_SCSS_GLOB = 'server/**/*.scss';

const DIST_DIR = 'dist';
const GENERATED_DOC_DIR = 'docs/generated';

const ELECTRON_ENTRY_POINT = 'dist/server/electron/main.js';

gulp.task('clean', () => {
  return del([DIST_GLOB, GENERATED_DOCS_GLOB]);
});

gulp.task('transpileTypeScript', () => {
  const tsResult = gulp.src(SERVER_TYPESCRIPT_GLOB).pipe(tsProject());
  return tsResult.js.pipe(gulp.dest(DIST_DIR));
});

gulp.task('copyFiles', () => {
  return gulp
    .src([SERVER_GLOB, SERVER_EXCLUDE_TRANSPILED_GLOB])
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('typeDoc', () => {
  return gulp.src([SERVER_TYPEDOC_GLOB]).pipe(
    gulpTypedoc({
      out: GENERATED_DOC_DIR,
      mode: 'modules',
      target: 'ES6',
      name: 'Project Caffeinated Monkey',
      version: true,
    }),
  );
});

gulp.task('eslint', () => {
  return gulp.src(SERVER_SOURCE_GLOB).pipe(eslint());
});

gulp.task('sass', function () {
  return gulp
    .src(SERVER_SCSS_GLOB)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task(
  'build',
  gulp.parallel('transpileTypeScript', 'sass', 'copyFiles', 'typeDoc'),
);

gulp.task('default', gulp.series('eslint', 'build'));

gulp.task('cleanBuild', gulp.series(gulp.parallel('clean', 'eslint'), 'build'));

gulp.task('electron-execute', () => {
  return gulp.src(DIST_DIR).pipe(runElectron([ELECTRON_ENTRY_POINT]));
});
gulp.task('run:electron', gulp.series('default', 'electron-execute'));

gulp.task('rebuild:node', shell.task('npm rebuild'));
gulp.task('rebuild:electron', shell.task('npx electron-rebuild'));
/*
 *
 */

gulp.task('watch', () => {
  gulp.watch([SERVER_TYPESCRIPT_GLOB], gulp.series(['transpileTypeScript']));
  gulp.watch([SERVER_SCSS_GLOB], gulp.series(['sass']));
  gulp.watch(
    [SERVER_GLOB, SERVER_EXCLUDE_TRANSPILED_GLOB],
    gulp.series(['copyFiles']),
  );
  nodemon({
    script: 'dist/server/controller/ExpressMain.js',
    ext: 'js css html',
    watch: ['dist'],
  });
});

gulp.task('develop', gulp.series(['cleanBuild', 'watch']));
