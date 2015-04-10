var Schemas = require('../database/schema').Schemas;
var mycommonfun = {};
mycommonfun.str2obj = function(str, obj) {
 
  if (str && str !== '') {
     if (!obj || typeof(obj) !== 'object')
    obj = {};

    var tmp = str.split('&');
    for (var i in tmp) {
      var kv = tmp[i].split('=');
      obj[kv[0]] = kv[1];
    }
  }else{
    obj=null;
  }

  return obj;
}

mycommonfun.cloneobj=function(obj){
    var newobj={};
    if (obj && obj !== null) {
        for (var key in obj) {
            newobj[key]=obj[key];
        }}
    return newobj;
}

mycommonfun.obj2str = function(obj) {
  var str = "";
  if (obj && obj !== null) {
    for (var key in obj) {
      if (key !== 'id')
        str += key + '=' + obj[key] + '&';
    }
  }
  return str;
}

mycommonfun.checkip = function(ip) {
  return (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(ip));
}

mycommonfun.addlocalnum = function(num, localtype, assign, cb) {
  Schemas.pbxLocalNumber.create({
    id: num,
    localtype: localtype,
    assign: assign
  }, function(err, inst) {
    cb(err, inst);
  });
}

mycommonfun.dellocalnum = function(num, cb) {
  Schemas.pbxLocalNumber.find(num, function(err, inst) {
    if (inst != null) {
      inst.destroy(function(err) {
        cb(err, null);
      });
    } else {
      cb(err, inst);
    }
  });
}

mycommonfun.searchContions=function(whereContions){
    var where=whereContions || "";
    where=where.replace(/^(keywordsKey)/,"");
    var whereObj={};
    if(where!==""){
        where=where.split("keywordsKey");
        for(var i in where){
            var kv=where[i].split("keywordsValue");
            whereObj[kv[0]]=kv[1] || "";
        }
    }
    return whereObj;
}


module.exports = mycommonfun;