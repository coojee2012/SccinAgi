/**
 * Created by pc-hp on 2015/5/15.
 */
function simpleQuery(req, res, next, db, logger, sql) {
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    db.DataQuery(sql).then(function (data) {
        if (!data) {
            logger.info(sql);
            data = [];
        }
        var result = {
            total: data.length,
            rows: data
        };
        res.send(result);
    }, function (err) {
        res.send(err);
    }).catch(function (err) {
        res.send(err);
    });
}
function pageionQuery(req, res, next, db, logger, sql){
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }
    if(query && typeof(query.id)=='undefined'){
        query.id='0';
    }
    //window.alert(JSON.stringify(query));
    var pageNumber = query.page || 1;
    var pageSize = query.rows || 5;

    db.DataQuery(sql).then(function (data) {
        if (!data) {
            logger.info(sql);
            data = [];
        }
        var result = {};
        if (query.id === "0") {
            result = {
                total: data.length,
                rows: data.slice(pageSize * (pageNumber - 1), pageSize * pageNumber)
            };
        } else {
            result = data;
        }
        res.send(result);
    }, function (err) {
        console.log("err:" + err);
        //res.send(err);
        next(err+".SQL:"+sql);
    }).catch(function (err) {
        // res.send(err);
        console.log("err:" + err);
        next(err+".SQL:"+sql);
    });
}
function getLastDate(){
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var str = date.getFullYear() + '-' + month + '-' + day;
    return str;
}

module.exports = {
    simpleQuery: simpleQuery,
    pageionQuery:pageionQuery,
    getLastDate: getLastDate
}