module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      base: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
        'app.build.js': ['app.js']
      }
      },
      router: {
        options: {
          banner: '/*! 路由处理程序 <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: [{
          expand: true,
          cwd: 'routes/src',
          src: '**/*.js',
          dest: 'routes/build'
        }]
      },
      modules: {
        options: {
          banner: '/*! 数据库表结构 <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: [{
          expand: true,
          cwd: 'modules/src',
          src: '**/*.js',
          dest: 'modules/build'
        }]
      }
    },
    concat: {
      options: {
        //定义一个字符串插入没个文件之间用于连接输出
        separator: ';'
      },
      dist: {
        src: ['src/*.js'],
        dest: 'build/<%= pkg.name %>.cat.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'app.js'],
      options: {
        globals: {
          exports: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });


  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'jshint']);
};