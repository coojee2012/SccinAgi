/**
 * Created by LinYong on 2015-01-22.
 */
var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    q = require('q');

var pass = process.argv[2];
var host = process.argv[3];
var port = process.argv[4];

if (!pass || !host || !port) {
    console.log("password , host ,port can't passed in cammond!");
} else {
    var cmd = "sshpass -p '" + pass + "' " + "ssh -N -f -R "+port+":127.0.0.1:22 " + host;
    var regx = RegExp('ssh\\s+-N\\s+-f\\s+-R\\s+'+port+':127.0.0.1:22\\s+' + host);
    setInterval(function () {
        q.delay(10000).then(function () {
            return psgrep();
        }).then(function (data) {
            console.log(regx,regx.test(data));
            if (regx.test(data)) {
                console.log("program is running.");
            } else {
                return RunCmd(cmd);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }, 5000);
}


function psgrep() {
    var deferred = q.defer();
    var grepStr = "",
        ps = spawn('ps', ['aux']),
        grep = spawn('grep', ['ssh']);

    ps.stdout.on('data', function (data) {
        grep.stdin.write(data);
    });

    ps.stderr.on('data', function (data) {
        console.log('ps stderr: ' + data);
        deferred.reject(data);
    });

    ps.on('close', function (code) {
        if (code !== 0) {
            console.log('ps process exited with code ' + code);
        }
        grep.stdin.end();
    });

    grep.stdout.on('data', function (data) {
        console.log('grep data:' + data);
        grepStr += data;

    });

    grep.stderr.on('data', function (data) {
        console.log('grep stderr: ' + data);

        deferred.reject(data);
    });

    grep.on('close', function (code) {
        if (code !== 0) {
            console.log('grep process exited with code ' + code);
        }
        deferred.resolve(grepStr);
    });
    return deferred.promise;
}

function RunCmd(cmd) {
    var deferred = q.defer();
    var child = exec(cmd, function (err, stdout, stderr) {
        if (err) {
            deferred.reject(err);
        } else if (stderr) {
            deferred.reject(stderr);
        }
        else {
            deferred.resolve(stdout);
        }
    });
    return deferred.promise;
}