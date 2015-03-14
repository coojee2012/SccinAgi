/*! 数据库表结构 2014-03-22 */
exports.Dbs=Dbs,schema.isActual(function(a,b){b?console.log("所有的表是最新的！"):schema.autoupdate(function(){console.log("更新表！")})});