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
          'modules/DBModules.min.js':['modules/DBModules.js']
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
        src: ['../DBModules/DBHearder.js',
          '../DBModules/pbx/CallProcees.js',
          '../DBModules/pbx/Card.js',
          '../DBModules/pbx/Cdr.js',
          '../DBModules/pbx/Conference.js',
          '../DBModules/pbx/ExtenGroupRelations.js',
          '../DBModules/pbx/ExtenGroup.js',
          '../DBModules/pbx/Extension.js',
          '../DBModules/pbx/IvrActMode.js',
          '../DBModules/pbx/IvrActions.js',
          '../DBModules/pbx/IvrInputs.js',
          '../DBModules/pbx/IvrMenmu.js',
          '../DBModules/pbx/LocalNumber.js',
          '../DBModules/pbx/LostCall.js',
          '../DBModules/pbx/Queue.js',
          '../DBModules/pbx/RecordFile.js',
          '../DBModules/pbx/Router.js',
          '../DBModules/pbx/ScreenPop.js',
          '../DBModules/pbx/Sounds.js',
          '../DBModules/pbx/Trunk.js',
          '../DBModules/pbx/MobileCode.js',
          '../DBModules/pbx/BlackList.js',
          '../DBModules/crm/CallRecords.js',
          '../DBModules/crm/CallPhone.js',
          '../DBModules/crm/CallLog.js',
          '../DBModules/crm/DialResult.js',
          '../DBModules/crm/KeyType.js',
          '../DBModules/crm/UserKeysRecord.js',
          '../DBModules/crm/VoiceContent.js',
          '../DBModules/pbx/AutoMonitorWays.js',
          '../DBModules/DBEnd.js'
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
