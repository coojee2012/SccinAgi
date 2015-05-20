/**
 * Created by LinYong on 2015-01-26.
 */
/**
 * Created by LinYong on 2015-01-26.
 */
var common=require('../lib/common.js');
var simpleQuery=common.simpleQuery;
var pageionQuery=common.pageionQuery;
var getLastDate=common.getLastDate;
var Q=require('q');

//专业应答情况
function zyydqk(req, res, next, db, logger) {
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    if (query && typeof(query.id) == 'undefined') {
        query.id = '0';
    }
    if (query && typeof(query.dateFrom) == 'undefined') {
        query.dateFrom = getLastDate() + ' 00:00:00';
    }

    if (query && typeof(query.dateTo) == 'undefined') {
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
    sql += " WHERE ISNULL(a.专业ID,'') <> '' AND a.日期 > '" + query.dateFrom + "' AND a.日期 < '"+query.dateTo+"' " ;
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
//网络终端受理招标项目月度情况
function slzbxmyd(req, res, next, db, logger){
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    var sqlArray= [];
    sqlArray.push(" SELECT A.[网络终端ID] AS zdid,B.[网络终端] AS zdmc , A.[年份] AS y, ");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 1 THEN 1 ELSE 0 END)  AS m1 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 2 THEN 1 ELSE 0 END)  AS m2 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 3 THEN 1 ELSE 0 END)  AS m3 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 4 THEN 1 ELSE 0 END)  AS m4 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 5 THEN 1 ELSE 0 END)  AS m5 , ");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 6 THEN 1 ELSE 0 END)  AS m6 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 7 THEN 1 ELSE 0 END)  AS m7 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 8 THEN 1 ELSE 0 END)  AS m8 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 9 THEN 1 ELSE 0 END)  AS m9 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 10 THEN 1 ELSE 0 END)  AS m10 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 11 THEN 1 ELSE 0 END)  AS m11 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 12 THEN 1 ELSE 0 END)  AS m12");
    sqlArray.push("FROM [抽取活动] A LEFT JOIN [网络终端] B ON B.ID = A.网络终端ID WHERE 1=1");
    if (query && typeof(query.year) != 'undefined') {
        sqlArray.push("AND A.[年份] = '"+query.year+"年'");
    }
    if (query && typeof(query.zdid) != 'undefined') {
        sqlArray.push("AND A.[网络终端ID] = '"+query.zdid+"'");
    }
    sqlArray.push("GROUP BY  A.[年份], A.[网络终端ID],B.[网络终端] ORDER BY A.[年份] DESC");
    var sql=sqlArray.join(" ");
    console.log(sql);
    simpleQuery(req, res, next, db, logger, sql);
}

//网络终端计划抽取专家情况月度表
function sljhcqyd(req, res, next, db, logger){
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }
    var sqlArray= [];
    sqlArray.push(" SELECT A.[网络终端ID] AS zdid,B.[网络终端] AS zdmc , A.[年份] AS y, ");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 1 THEN A.[抽取人数] ELSE 0 END)  AS m1 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 2 THEN A.[抽取人数] ELSE 0 END)  AS m2 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 3 THEN A.[抽取人数] ELSE 0 END)  AS m3 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 4 THEN A.[抽取人数] ELSE 0 END)  AS m4 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 5 THEN A.[抽取人数] ELSE 0 END)  AS m5 , ");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 6 THEN A.[抽取人数] ELSE 0 END)  AS m6 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 7 THEN A.[抽取人数] ELSE 0 END)  AS m7 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 8 THEN A.[抽取人数] ELSE 0 END)  AS m8 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 9 THEN A.[抽取人数] ELSE 0 END)  AS m9 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 10 THEN A.[抽取人数] ELSE 0 END)  AS m10 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 11 THEN A.[抽取人数] ELSE 0 END)  AS m11 ,");
    sqlArray.push("sum(CASE  A.月份KEY WHEN 12 THEN A.[抽取人数] ELSE 0 END)  AS m12");
    sqlArray.push("FROM [抽取活动] A LEFT JOIN [网络终端] B ON B.ID = A.网络终端ID WHERE 1=1");
    if (query && typeof(query.year) != 'undefined') {
        sqlArray.push("AND A.[年份] = '"+query.year+"年'");
    }
    if (query && typeof(query.zdid) != 'undefined') {
        sqlArray.push("AND A.[网络终端ID] = '"+query.zdid+"'");
    }
    sqlArray.push("GROUP BY  A.[年份], A.[网络终端ID],B.[网络终端] ORDER BY A.[年份] DESC");
    var sql=sqlArray.join(" ");
    console.log(sql);
    simpleQuery(req, res, next, db, logger, sql);
}

//网络终端招标项目受理情况表
function xmslqk(req,res,next,db,logger){
    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }
    var sqlArray= [];
    sqlArray.push(" SELECT A.[网络终端ID] AS zdid,B.[网络终端] AS zdmc , A.[年份] AS y, ");
    sqlArray.push("sum( CASE A.[填报类型] WHEN 1 THEN 1 ELSE  0 END ) AS rzyh,");
    sqlArray.push("sum( CASE A.[填报类型] WHEN 2 THEN 1 ELSE  0 END ) AS qtyh,");
    sqlArray.push("sum( CASE A.[填报类型] WHEN 3 THEN 1 ELSE  0 END ) AS xcyh ");
    sqlArray.push("FROM [抽取活动] A LEFT JOIN [网络终端] B ON B.ID = A.网络终端ID WHERE 1=1");
    if (query && typeof(query.year) != 'undefined') {
        sqlArray.push("AND A.[年份] = '"+query.year+"年'");
    }
    if (query && typeof(query.zdid) != 'undefined') {
        sqlArray.push("AND A.[网络终端ID] = '"+query.zdid+"'");
    }
    sqlArray.push("GROUP BY  A.[年份], A.[网络终端ID],B.[网络终端] ORDER BY A.[年份] DESC");
    var sql=sqlArray.join(" ");
    console.log(sql);
    simpleQuery(req, res, next, db, logger, sql);
}

//各网络终端一定时间段内招标项目受理情况汇总表
//年报
function gzdslYear(req,res,next,db,logger){
var sql="SELECT * FROM [网络终端]";
    db.DataQuery(sql).then(function (data) {
        if (!data) {
            logger.info(sql);
            data = [];
        }
       return  arrayQ(db,data);
    }).then(function(values){
        res.send(values);
    }).fail(function (err) {
        res.send(err);
    });
}

//各网络终端一定时间段内招标项目受理情况汇总表
//月报
function gzdslMonth(req,res,next,db,logger){
    var sql="SELECT * FROM [网络终端]";
    db.DataQuery(sql).then(function (data) {
        if (!data) {
            logger.info(sql);
            data = [];
        }
        return  arrayQM(db,data);
    }).then(function(values){
        res.send(values);
    }).fail(function (err) {
        res.send(err);
    });
}

//各网络终端一定时间段内受理招标项目的招标类型统计表
//年报
function gzdsllxYear(req,res,next,db,logger){
    var sql1="SELECT * FROM [网络终端]";
    var sql2="SELECT * FROM [招标类型]";
    var array=[];
    array.push(db.DataQuery(sql1));
    array.push(db.DataQuery(sql2));

    Q.all(array).then(function(values){
        //res.send(values);
        return arrayLxQY(db,values);
    }).then(function(values){
        res.send(values);
    }).fail(function(err){
        res.send(err);
    });

}

//各网络终端一定时间段内受理招标项目的行业类型统计表（年/月）
//年报
function gzdslhyYear(req,res,next,db,logger){
    var sql1="SELECT * FROM [网络终端]";
    var sql2="SELECT * FROM [行业]";
    var array=[];
    array.push(db.DataQuery(sql1));
    array.push(db.DataQuery(sql2));

    Q.all(array).then(function(values){
        //res.send(values);
        return arrayHyQY(db,values);
    }).then(function(values){
        res.send(values);
    }).fail(function(err){
        res.send(err);
    });

}
//各网络终端一定时间段内受理招标项目的资金来源统计表
function gzdsllyYear(req,res,next,db,logger){
    var sql1="SELECT * FROM [网络终端]";
    var sql2="SELECT * FROM [资金来源]";
    var array=[];
    array.push(db.DataQuery(sql1));
    array.push(db.DataQuery(sql2));

    Q.all(array).then(function(values){
        //res.send(values);
        return arrayLyQY(db,values);
    }).then(function(values){
        res.send(values);
    }).fail(function(err){
        res.send(err);
    });

}




function arrayQ(db,array,list,deferred){
    deferred =  deferred ||  Q.defer();
    list = list || [];
    if(array.length > 0) {
        var sqlArray = [];
        var tmpObj = array.pop();
        sqlArray.push(" SELECT TOP 10  A.[年份] AS y, ");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 1 THEN 1 ELSE  0 END ) AS rzyh,");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 2 THEN 1 ELSE  0 END ) AS qtyh,");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 3 THEN 1 ELSE  0 END ) AS xcyh, ");
        sqlArray.push("sum([抽取人数]) AS cqrs");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [网络终端] B ON B.ID = A.网络终端ID WHERE 1=1");
        sqlArray.push("AND A.[网络终端ID] = '" + tmpObj.ID + "'");
        sqlArray.push("GROUP BY  A.[年份] ORDER BY A.[年份] DESC");
        var sqlStr = sqlArray.join(" ");
        db.DataQuery(sqlStr).then(function (data) {
            var obj = {};
            obj[tmpObj.网络终端] = data;
            list.push(obj);
            arrayQ(db, array, list, deferred);
        });
    }else{
        deferred.resolve(list);
    }
    return deferred.promise;
}
function arrayQM(db,array,list,deferred){
    deferred =  deferred ||  Q.defer();
    list = list || [];
    if(array.length > 0) {
        var sqlArray = [];
        var tmpObj = array.pop();
        sqlArray.push(" SELECT TOP 12  A.[年份] AS y,A.[月份key] AS m, ");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 1 THEN 1 ELSE  0 END ) AS rzyh,");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 2 THEN 1 ELSE  0 END ) AS qtyh,");
        sqlArray.push("sum( CASE A.[填报类型] WHEN 3 THEN 1 ELSE  0 END ) AS xcyh, ");
        sqlArray.push("sum([抽取人数]) AS cqrs");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [网络终端] B ON B.ID = A.网络终端ID WHERE 1=1");
        sqlArray.push("AND A.[网络终端ID] = '" + tmpObj.ID + "'");
        sqlArray.push("GROUP BY  A.[年份],A.[月份key] ORDER BY A.[年份] DESC,A.[月份key] DESC");
        var sqlStr = sqlArray.join(" ");
        db.DataQuery(sqlStr).then(function (data) {
            var obj = {};
            obj[tmpObj.网络终端] = data;
            list.push(obj);
            arrayQM(db, array, list, deferred);
        });
    }else{
        deferred.resolve(list);
    }
    return deferred.promise;
}
function arrayLxQY(db,array){
   var deferred =   Q.defer();
    var zds=array[0];
    var lxs=array[1];
    var sumStr=[];
    for(var i = 0;i<lxs.length;i++){
        sumStr.push("sum(CASE B.[招标类型ID] WHEN '"+lxs[i].ID+"' THEN 1 ELSE 0 END ) AS [xm_"+lxs[i].ID+"],");
        sumStr.push("sum(CASE B.[招标类型ID] WHEN '"+lxs[i].ID+"' THEN A.[抽取人数] ELSE 0 END ) AS [cq_"+lxs[i].ID+"],");
    }
    var sqlSumStr=sumStr.join(" ");
    var fnArray=[];
    for(var m=0;m<zds.length;m++){
        var sqlArray = [];
        var tmpObj = zds[m];
        sqlArray.push(" SELECT TOP 10  ");
        sqlArray.push(sqlSumStr);
        sqlArray.push("A.[年份] AS y");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [招标项目] B ON B.ID = A.招标项目ID WHERE 1=1");
        sqlArray.push("AND A.[网络终端ID] = '" + tmpObj.ID + "'");
        sqlArray.push("GROUP BY  A.[年份] ORDER BY A.[年份] DESC");
        var sqlStr = sqlArray.join(" ");
        fnArray.push(db.DataQuery(sqlStr));
    }
    Q.all(fnArray).then(function(values){
        var obj={};
        obj.xmlx=lxs;
        obj.wlzd=zds;
        obj.data={};
        for(var j=0;j<values.length;j++){
            obj.data[zds[j].ID]=values[j];
        }
        deferred.resolve(obj);
    }).fail(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
}
function arrayHyQY(db,array){
    var deferred =   Q.defer();
    var zds=array[0];
    var lxs=array[1];
    var sumStr=[];
    for(var i = 0;i<lxs.length;i++){
        sumStr.push("sum(CASE B.[所属行业ID] WHEN '"+lxs[i].ID+"' THEN 1 ELSE 0 END ) AS [xm_"+lxs[i].ID+"],");
        sumStr.push("sum(CASE B.[所属行业ID] WHEN '"+lxs[i].ID+"' THEN A.[抽取人数] ELSE 0 END ) AS [cq_"+lxs[i].ID+"],");
    }
    var sqlSumStr=sumStr.join(" ");
    var fnArray=[];
    for(var m=0;m<zds.length;m++){
        var sqlArray = [];
        var tmpObj = zds[m];
        sqlArray.push(" SELECT TOP 10  ");
        sqlArray.push(sqlSumStr);
        sqlArray.push("A.[年份] AS y");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [招标项目] B ON B.ID = A.招标项目ID WHERE 1=1");
        sqlArray.push("AND A.[网络终端ID] = '" + tmpObj.ID + "'");
        sqlArray.push("GROUP BY  A.[年份] ORDER BY A.[年份] DESC");
        var sqlStr = sqlArray.join(" ");
        fnArray.push(db.DataQuery(sqlStr));
    }
    Q.all(fnArray).then(function(values){
        var obj={};
        obj.sshy=lxs;
        obj.wlzd=zds;
        obj.data={};
        for(var j=0;j<values.length;j++){
            obj.data[zds[j].ID]=values[j];
        }
        deferred.resolve(obj);
    }).fail(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
}
function arrayLyQY(db,array){
    var deferred =   Q.defer();
    var zds=array[0];
    var lxs=array[1];
    var sumStr=[];
    for(var i = 0;i<lxs.length;i++){
        sumStr.push("sum(CASE C.[资金来源ID] WHEN '"+lxs[i].id+"' THEN 1 ELSE 0 END ) AS [xm_"+lxs[i].id+"],");
        sumStr.push("sum(CASE C.[资金来源ID] WHEN '"+lxs[i].id+"' THEN A.[抽取人数] ELSE 0 END ) AS [cq_"+lxs[i].id+"],");
    }
    var sqlSumStr=sumStr.join(" ");
    var fnArray=[];
    for(var m=0;m<zds.length;m++){
        var sqlArray = [];
        var tmpObj = zds[m];
        sqlArray.push(" SELECT TOP 10  ");
        sqlArray.push(sqlSumStr);
        sqlArray.push("A.[年份] AS y");
        sqlArray.push("FROM [抽取活动] A LEFT JOIN [招标项目] B ON B.ID = A.招标项目ID LEFT JOIN [项目] C ON C.id = B.项目ID WHERE 1=1");
        sqlArray.push("AND A.[网络终端ID] = '" + tmpObj.ID + "'");
        sqlArray.push("GROUP BY  A.[年份] ORDER BY A.[年份] DESC");
        var sqlStr = sqlArray.join(" ");
        fnArray.push(db.DataQuery(sqlStr));
    }
    Q.all(fnArray).then(function(values){
        var obj={};
        obj.sshy=lxs;
        obj.wlzd=zds;
        obj.data={};
        for(var j=0;j<values.length;j++){
            obj.data[zds[j].ID]=values[j];
        }
        deferred.resolve(obj);
    }).fail(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
}


module.exports = {
    zyydqk: zyydqk,//专业应答情况。参数:{id:专业编号,dateFrom:从,dateTo:到}
    slzbxmyd:slzbxmyd,//网络终端受理招标项目月度情况 。参数 ： {year:年份,zdid:网络终端ID }
    sljhcqyd:sljhcqyd,//网络终端计划抽取专家情况月度表。参数：{year:年份,zdid:网络终端ID}
    xmslqk:xmslqk,//网络终端招标项目受理情况表。参数{year:年份,zdid:网络终端ID}
    gzdslyear:gzdslYear,//各网络终端一定时间段内招标项目受理情况汇总表,年报
    gzdslmonth:gzdslMonth,//各网络终端一定时间段内招标项目受理情况汇总表,月报
    gzdsllxyear:gzdsllxYear,//各网络终端一定时间段内受理招标项目的[招标类型]统计表
    gzdslhyyear:gzdslhyYear,//各网络终端一定时间段内受理招标项目的[行业类型]统计表
    gzdsllyyear:gzdsllyYear,//各网络终端一定时间段内受理招标项目的[资金来源]统计表
    test:function(req, res, next, db, logger){
        res.send({test:"test"});
    }
}
