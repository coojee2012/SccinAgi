/**
 * Created by LinYong on 2015-01-26.
 */
var common = require('../lib/common.js');
var simpleQuery = common.simpleQuery;
var pageionQuery = common.pageionQuery;
var getLastDate = common.getLastDate;
var Q = require('q');

function zyydqk(req, res, next, db, logger) {
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    if (query && typeof(query.id) != 'undefined') {
        query.id = '0';
    }
    if (query && typeof(query.dateFrom) != 'undefined') {
        query.dateFrom = getLastDate() + ' 00:00:00';
    }

    if (query && typeof(query.dateTo) != 'undefined') {
        query.dateTo = getLastDate() + ' 23:59:59';
    }

    var sql = "SELECT ";
    if (query && query.id === "0") {
        sql += " SUBSTRING(a.专业ID,1,4)+'0000' AS id, (SELECT 专业名称 FROM 专业 WHERE id=SUBSTRING(a.专业ID,1,4)+'0000') AS name,0 AS parentId,'closed' AS state, ";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql += " SUBSTRING(a.专业ID,1,6)+'00' AS id,  (SELECT 专业名称 FROM 专业 WHERE id=SUBSTRING(a.专业ID,1,6)+'00') AS name,'" + query.id + "' AS parentId  ,'closed' AS state,";
    } else {
        sql += " a.专业ID AS id,  (SELECT 专业名称 FROM 专业 WHERE id=a.专业ID) AS name,'" + query.id + "' AS parentId  ,'closed' AS state,";
    }
    sql += " SUM(a.专家总数) AS total,SUM(a.计划抽取) AS jhcq,SUM(a.抽中) AS cz,SUM(a.未接听) AS wjt ,";
    sql += " SUM(a.拒绝) AS jj,SUM(a.实际参评) AS sjcp,SUM(a.请假) AS qj,SUM(a.事先缺席) AS sxqx ,";
    sql += " SUM(a.无故缺席) AS wgqx,SUM(a.主动回避) AS zdhb";
    sql += " FROM 专业应答情况  AS a LEFT JOIN 专业 AS b ON a.专业ID=b.id";
    sql += " WHERE ISNULL(a.专业ID,'') <> '' AND a.日期 > '" + query.dateFrom + "' AND a.日期 < '" + query.dateTo + "' ";
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
    pageionQuery(req, res, next, db, logger, sql);
}

//招标类型
function zblx(req, res, next, db, logger) {
    var sql2 = "SELECT * FROM [招标类型]";
    var keys=['日期'];
    db.DataQuery(sql2).then(function (dbs) {
        var sumArray = [];
        for (var i = 0; i < dbs.length; i++) {
            sumArray.push("sum(CASE B.[招标类型ID] WHEN '" + dbs[i].ID + "' THEN 1 ELSE 0 END ) AS [" + dbs[i]['招标类型'] + "],");
            keys.push(dbs[i]['招标类型']);
        }
        var sumStr = sumArray.join(" ");
        var sqlArray = [];

        sqlArray.push(" SELECT TOP 10  ");
        sqlArray.push(sumStr);
        sqlArray.push("A.[年份] AS [日期]");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [招标项目] B ON B.ID = A.招标项目ID WHERE 1=1");
        sqlArray.push("GROUP BY  A.[年份] ORDER BY A.[年份] DESC");
        var sqlStr = sqlArray.join(" ");
        return db.DataQuery(sqlStr)


    }).then(function (dbs) {
        var obj={};
        obj.keys=keys;
        obj.data=dbs;
        res.send(obj);
    }).fail(function (err) {
        res.send(err);
    });

}

module.exports = {
    zyydqk: zyydqk,
    zblx:zblx,//招标类型
    test: function () {
    }
}