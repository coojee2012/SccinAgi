module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //代码压缩
    uglify: {
      base: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
          'server.min.js': ['server.js']
        }
      },
      smartAgi: {
        options: {
          banner: '/*! AGI <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: [{
          expand: true,
          cwd: 'smartAgi/src',
          src: 'Routings.js',
          dest: 'smartAgi/build'
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
    //文件合并
    concat: {
        options: {
          //定义一个字符串插入没个文件之间用于连接输出
          separator: ';'
        },
        smartAgi: {
          src: ['smartAgi/src/routing.js','smartAgi/src/*.cat.js'],
          dest: 'smartAgi/src/Routings.js'
        }
      

    },
    //代码检测
    jshint: {
      files: ['Gruntfile.js', 'server.js'],
      options: {
        globals: {
          exports: true
        }
      }
    },
    //代码修改检查
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