/**
 * Created by LinYong on 2015-01-26.
 */

function test(req, res, next, db, logger) {
    var sql = "select  sum(total) as total,";
    sql += "  sum(age20) as age20,sum(age30) as age30,sum(age40) as age40,sum(age50) as age50,sum(age60) as age60,sum(age70) as age70,";
    sql += "  SUBSTRING(tid,1,4)+'0000' as id,0 as parentId , 'dd' as name ,'closed' as state from (";
    sql += "  select 1 as total, a.id as tid,";
    sql += "  case when c.年龄 <= 30 then 1 else 0 end as age20,";
    sql += "  case when c.年龄 > 30  and  c.年龄 <=40 then 1 else 0 end as age30,";
    sql += "  case when c.年龄 > 40  and  c.年龄 <=50 then 1 else 0 end as age40,";
    sql += "  case when c.年龄 > 50  and  c.年龄 <=60 then 1 else 0 end as age50,";
    sql += "  case when c.年龄 > 60  and  c.年龄 <=70 then 1 else 0 end as age60,";
    sql += "  case when c.年龄 > 70  then 1 else 0 end as age70";
    sql += "  from 专业 as a";
    sql += "  LEFT JOIN 专家专业关联 b on a.id=b.专业id";
    sql += "  LEFT JOIN 专家 c on b.专家id=c.id";
    sql += "  where a.专业状态=1";
    sql += "  ) as temp";
    sql += "  group by SUBSTRING(tid,1,4) order by total ";

    db.DataQuery(sql).then(function (data) {
        res.send({success: true, msg: "IN TEST FUNCTION", data: data, length: data.length});
    }, function (err) {
        res.send(err);
    }).catch(function (err) {
        res.send("err:" + err);
    });
}

function zyfb(req, res, db, logger) {

}

function knzj(req, res, next, db, logger) {
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }
    var sql = "SELECT TOP 10 * FROM 库内专家状态汇总 ORDER BY 年份 DESC ";
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
/***
 * 库内正式专家情况统计
 * @param req
 * @param res
 * @param next
 * @param db
 * @param logger
 */
function knzszj(req, res, next, db, logger) {
    var sql = " SELECT TOP 1 * FROM 库内正式专家情况 ORDER BY 日期 DESC";
    simpleQuery(req, res, next, db, logger, sql);
}
/***
 * 库内候选专家情况统计
 * @param req
 * @param res
 * @param next
 * @param db
 * @param logger
 */
function knhxzj(req, res, next, db, logger){
var sql="SELECT TOP 1 * FROM  库内候选专家情况 ORDER BY 日期 DESC";
    simpleQuery(req, res, next, db, logger, sql);
}
/***
 * 简单查询
 * @param req
 * @param res
 * @param next
 * @param db
 * @param logger
 * @param sql
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
/***
 * 专家专业-性比、年龄段统计
 * @param req
 * @param res
 * @param next
 * @param db
 * @param logger
 */
function zynl(req, res, next, db, logger) {

    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    //window.alert(JSON.stringify(query));
    var pageNumber = query.page || 1;
    var pageSize = query.rows || 5;

    var sql = "SELECT ";
    if (query && query.id === "0") {
        sql += " SUBSTRING(a.专业ID,1,4)+'0000' AS id, (SELECT 专业名称 FROM 专业 WHERE id=SUBSTRING(a.专业ID,1,4)+'0000') AS name,0 AS parentId,'closed' AS state, ";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql += " SUBSTRING(a.专业ID,1,6)+'00' AS id,  (SELECT 专业名称 FROM 专业 WHERE id=SUBSTRING(a.专业ID,1,6)+'00') AS name,'" + query.id + "' AS parentId  ,'closed' AS state,";
    } else {
        sql += " a.专业ID AS id,  (SELECT 专业名称 FROM 专业 WHERE id=a.专业ID) AS name,'" + query.id + "' AS parentId  ,'closed' AS state,";
    }
    sql += " SUM(a.专家总数) AS total,SUM(a.男性) AS man,SUM(a.女性) AS women,SUM(a.年龄35及以下) AS age35,SUM(a.年龄3645) AS age45,";
    sql += " SUM(a.年龄4655) AS age55,SUM(a.年龄5665) AS age65,SUM(a.年龄66及以上) AS age70";
    sql += " FROM 专家年龄及性别  AS a LEFT JOIN 专业 AS b ON a.专业ID=b.id";
    sql += " WHERE ISNULL(a.专业ID,'') <> ''";
    if (query && query.id.substr(4, 4) === "0000") {
        sql += " AND SUBSTRING(b.父专业ID,1,4)='" + query.id.substr(0, 4) + "'";

    } else if (query && query.id.substr(6, 2) === "00") {
        sql += " AND SUBSTRING(b.父专业ID,1,6)='" + query.id.substr(0, 6) + "'";
    } else if (query && query.id !== "0" && query.id.substr(query.id.length - 1, 2) !== '00') {
        sql += " AND SUBSTRING(b.父专业ID,1," + query.id.length + ")='" + query.id + "'";
    }

    if (query && query.id === "0") {
        sql += " GROUP BY SUBSTRING(a.专业ID,1,4) ORDER BY total DESC";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql += " GROUP BY SUBSTRING(a.专业ID,1,6) ORDER BY total DESC";
    } else {
        sql += " GROUP BY a.专业ID ORDER BY total DESC";
    }


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
        res.send(err);
    }).catch(function (err) {
        res.send(err);
        console.log("err:" + err);
    });
}

module.exports = {
    test: test,
    zyfb: zyfb,
    knzj: knzj,
    knzszj: knzszj,
    knhxzj:knhxzj,
    zynl: zynl
}