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

commonfun.guid = function() {
  return guid.create();
}
commonfun.unixtime = function() {
  var d = new Date();
  var unixtime = d.getTime();
  var random = Math.random() * 100;
  return unixtime.toString() + '-' + random.toString();
}
commonfun.mkdir = function(path, cb) {
  fs.exists(path, function(exists) {
    if (!exists) {
      fs.mkdir(path, function(err) {
        if (err) {
          cb('无法创建需要的目录：' + path, null);
        } else {
          cb(null, path);
        }
      });
    } else {
      cb(null, path);
    }
  });
}

//Parse the url, get the port
//e.g. http://www.google.com/path/another -> 80
//     http://foo.bar:8081/a/b -> 8081

commonfun.getPort = function(url) {
  var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
  var domain = url.match(hostPattern);

  var pos = domain[1].indexOf(":");
  if (pos !== -1) {
    domain[1] = domain[1].substr(pos + 1);
    return parseInt(domain[1]);
  } else if (url.toLowerCase().substr(0, 5) === "https") return 443;
  else return 80;
}

//Parse the url,get the host name
//e.g. http://www.google.com/path/another -> www.google.com

commonfun.getHost = function(url) {
  var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
  var domain = url.match(hostPattern);

  var pos = domain[1].indexOf(":");
  if (pos !== -1) {
    domain[1] = domain[1].substring(0, pos);
  }
  return domain[1];
}

commonfun.getPath = function(url) {
  var pathPattern = /\w+:\/\/([^\/]+)(\/.+)(\/$)?/i;
  var fullPath = url.match(pathPattern);
  return fullPath ? fullPath[2] : '/';
}

commonfun.delrecordfiles = function(schemas, dbs, callback) {
  var self = this;
  var fs = require('fs');
  var schema = schemas.pbxRcordFile;
  async.each(dbs, function(item, cb) {
    self.delbyid(schema, item.id, function(err, results) {
      if (err)
        cb(err);
      else {
        var file = item.folder + item.filename + item.extname;
        fs.unlink(file, cb);
      }
    });
  }, function(err) {
    callback(err, null);
  });
}

commonfun.delbyid = function(schema, id, cb) {
  schema.find(id, function(err, inst) {
    if (err) {
      cb(err, null);
    } else {
      if (!inst) {
        cb(null, null);
      } else {
        inst.destroy(function(err) {
          if (err) {
            cb(err, null);
          } else {
            cb(null, null);
          }
        });
      }
    }
  });
}

commonfun.getfilestate = function(filename, cb) {
  var fs = require('fs');
  fs.stat(filename, function(err, stats) {
    cb(err, stats);
  });
}