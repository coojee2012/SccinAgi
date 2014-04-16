var mycommonfun={};
 mycommonfun.str2obj=function(str,obj) {
  if(!obj || typeof(obj)!=='object')
    obj={};
  if (str && str !== '') {
    var tmp = str.split('&');
    for (var i in tmp) {
      var kv = tmp[i].split('=');
      obj[kv[0]] = kv[1];
    }
  }
  return obj;
}

 mycommonfun.obj2str=function(obj) {
  var str = "";
  if (obj && obj !== null) {
    for(var key in obj){
    	if(key!=='id')
    	str+=key+'='+obj[key]+'&';
    }
  }
  return str;
}


module.exports=mycommonfun;