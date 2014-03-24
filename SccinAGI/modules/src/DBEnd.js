exports.Dbs = Dbs;

/*    if (appconf.debug) {
    schema.automigrate(function() {
        console.log('创建表');

    });
}*/

schema.isActual(function(err, actual) {
	if (!actual) {
		schema.autoupdate(function(err) {
			console.log('更新表！');
		});
	}else{
		console.log('所有的表是最新的！');
	}
});

//console.log(Dbs);