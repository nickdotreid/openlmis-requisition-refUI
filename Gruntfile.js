module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var config = require('./config');
  var gulp = require('gulp');
  var styleguide = require('sc5-styleguide');
  var outputPath = '';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build', 'quality'],
    jshint: {
      options: {
        undef: false,
        strict: false,
        '-W030': true,
        unused: false,
        passfail: true,
        reporter: 'checkstyle',
        reporterOutput: 'quality/js/checkstyle-results.xml'
      },
      all: [config.app.src + '/webapp/public/js/**/*.js']
    },
    lesslint: {
      src: [config.app.src + '/webapp/public/less/*.less', '!**/ng-grid.less'],
      options: {
        quiet: true,
        formatters: [{
          id: 'checkstyle-xml',
          dest: 'quality/less/checkstyle-results.xml'
        }],
        csslint: {
          ids: false,
          "bulletproof-font-face": false,
          "box-model": false,
          "box-sizing": false
        }
      }
    },
    less: {
      compile: {
        files: [{
          expand: true,
          cwd: config.app.src + '/webapp/public/less/',
          src: ["**/*.less"],
          dest: config.app.dest + '/public/css',
          ext: ".css",
          flatten: false
        }]
      }
    },
    watch: {
      files: config.app.src + '/webapp/public/less/*.less',
      tasks: ["less"],
      options: {
        spawn: false
      }
    },
    uglify: {
      options: {
        mangle: false,
        beautify: true,
        report: 'min',
        preserveComments: false
      },
      files: {
        cwd: config.app.src + '/webapp/public/js/',
        src: ['**/*.js'],
        dest: config.app.dest + '/public/js',
        expand: true,
        flatten: false
      }
    },
    serve: {
      options: {
        port: 9000,
        serve: {
          path: config.app.dest
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.config.js'
      }
    },
    replace: {
      serverurl: {
        src: [config.app.dest + '/public/**/*.js'],
        overwrite: true,
        replacements: [{
          from: '@@OPENLMIS_SERVER_URL',
          to: grunt.option('openlmisServerURL') || config.openlmisServerURL
        }]
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/webapp/',
            src: ['*'],
            dest: config.app.dest + '/public',
            filter: 'isFile'
          }
        ],
      },
      images: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/webapp/public/images/',
            src: ['**'],
            dest: config.app.dest + '/public/images'
          }
        ],
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/webapp/public/fonts/',
            src: ['**'],
            dest: config.app.dest + '/public/fonts'
          }
        ],
      },
      pages: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/webapp/public/pages/',
            src: ['**'],
            dest: config.app.dest + '/public/pages'
          }
        ],
      },
      lib: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/webapp/public/lib/',
            src: ['**'],
            dest: config.app.dest + '/public/lib'
          }
        ],
      },
      messages: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/resources',
            src: ['messages_*.json'],
            dest: config.app.dest + '/public/messages'
          }
        ]
      },
      credentials: {
        files: [
          {
            expand: true,
            cwd: config.app.src + '/resources',
            src: ['auth_server_client.json'],
            dest: config.app.dest + '/public/credentials'
          }
        ]
      }
    },
    gulp: {
      'styleguide-generate': function() {
        return gulp.src([ config.app.src + "/resources/scss/*.scss",
                          config.app.src + "/resources/scss/body.css" ])
          .pipe(styleguide.generate({
            title: 'OpenLMIS Styleguide',
            rootPath: outputPath,
            appRoot: '/openlmis-requisition-refUI',
            extraHead: '<link rel="stylesheet" type="text/css" href="/openlmis-requisition-refUI/body.css"/>',
            disableHtml5Mode: true,
            overviewPath: config.app.src + '/resources/scss/overview.md'
          }))
          .pipe(gulp.dest(outputPath));
      },
      'styleguide-applystyles': function() {
        return gulp.src([ config.app.dest + "/public/lib/bootstrap/css/bootstrap.min.css",
                   config.app.dest + "/public/css/app.css",
                   config.app.dest + "/public/lib/select2/select2.css",
                   config.app.dest + "/public/lib/select2/select2.png" ])
          .pipe(styleguide.applyStyles())
          .pipe(gulp.dest(outputPath));
      },
      'styleguide-png': function() {
        return gulp.src([ config.app.dest + "/public/images/tab-error.png",
                   config.app.dest + "/public/images/close-icon.png" ])
          .pipe(gulp.dest(outputPath + "/images"));
      }
    }
  });

  grunt.registerTask('build', ['clean', 'copy', 'less', 'uglify', 'replace', 'karma']);
  grunt.registerTask('check', ['clean', 'jshint', 'lesslint']);
  grunt.registerTask('styleguide', ['gulp:styleguide-generate', 'gulp:styleguide-png', 'gulp:styleguide-applystyles']);
};