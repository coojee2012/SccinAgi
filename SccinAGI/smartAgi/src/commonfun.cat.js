function str2obj(str) {
  var obj = {};
  if (str && str !== '') {
    var tmp = str.split('&');
    for (var i in tmp) {
      var kv = tmp[i].split('=');
      obj[kv[0]] = kv[1];
    }
  }
  return obj;
}

commonfun.prototype.guid=function(){
	return guid.create();
}
commonfun.prototype.unixtime=function(){
	var d=new Date();
	var unixtime=d.getTime();
	var random = Math.random()*100;
	return unixtime.toString()+'-'+random.toString();
}
commonfun.prototype.mkdir=function(path,cb){
	 fs.exists(path, function(exists) {
            if (!exists) {
              fs.mkdir(path, function(err) {
                if (err) {
                  cb('无法创建需要的目录：'+path, null);
                } else {
                  cb(null, path);
                }
              });
            } else {
              cb(null, path);
            }
          });
}
