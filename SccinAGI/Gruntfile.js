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
        files: {
          'modules/DBModules.min.js':['modules/DBModules.js'],
        }
      }
    },
    //文件合并
    concat: {
      options: {
        //定义一个字符串插入没个文件之间用于连接输出
        separator: '\r\n'
      },
      smartAgi: {
        src: ['smartAgi/src/routing.js', 'smartAgi/src/*.cat.js'],
        dest: 'smartAgi/src/Routings.js'
      },
      DBModules: {
        src: ['modules/src/DBHearder.js',
          'modules/src/pbx/CallProcees.js',
          'modules/src/pbx/Card.js',
          'modules/src/pbx/Cdr.js',
          'modules/src/pbx/Conference.js',
          'modules/src/pbx/ExtenGroupRelations.js',
          'modules/src/pbx/ExtenGroup.js',
          'modules/src/pbx/Extension.js',
          'modules/src/pbx/IvrActMode.js',
          'modules/src/pbx/IvrActions.js',
          'modules/src/pbx/IvrInputs.js',
          'modules/src/pbx/IvrMenmu.js',
          'modules/src/pbx/LocalNumber.js',
          'modules/src/pbx/LostCall.js',
          'modules/src/pbx/Queue.js',
          'modules/src/pbx/RecordFile.js',
          'modules/src/pbx/Router.js',
          'modules/src/pbx/ScreenPop.js',
          'modules/src/pbx/Sounds.js',
          'modules/src/pbx/Trunk.js',
          'modules/src/pbx/MobileCode.js',
          'modules/src/pbx/BlackList.js',
          'modules/src/crm/CallRecords.js',
          'modules/src/crm/CallPhone.js',
          'modules/src/crm/CallLog.js',
          'modules/src/crm/DialResult.js',
          'modules/src/crm/KeyType.js',
          'modules/src/crm/UserKeysRecord.js',
          'modules/src/crm/VoiceContent.js',
          'modules/src/pbx/AutoMonitorWays.js',
          'modules/src/DBEnd.js'
        ],
        dest: 'modules/DBModules.js'
      }


    },
    //代码检测
    jshint: {
      files: ['server.js','modules/DBModules.js'],
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