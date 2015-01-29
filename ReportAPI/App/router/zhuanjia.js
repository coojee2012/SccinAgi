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

function zhuanyefenbu(req, res, db, logger) {

}

function zynl(req, res, next, db, logger) {

    var query = null;
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }

    //window.alert(JSON.stringify(query));
    var pageNumber=query.page;
    var pageSize=query.rows;
    var sql = "select  sum(total) as total,";
    sql += "  sum(age20) as age20,sum(age30) as age30,sum(age40) as age40,sum(age50) as age50,sum(age60) as age60,sum(age70) as age70,";
    if (query && query.id === "0") {
        sql += "  SUBSTRING(tid,1,4)+'0000' as id,0 as parentId , name ,'closed' as state from (";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql += "  SUBSTRING(tid,1,6)+'00' as id,'"+query.id+"' as parentId , name ,'closed' as state from (";
    } else {
        sql += "  tid as id,'"+query.id+"' as parentId , name ,'closed' as state from (";
    }

    sql += "  select 1 as total, a.id as tid,";
    sql += " case when SUBSTRING(a.id,5,4)='0000' then a.专业名称 else " ;
    if(query && query.id === "0"){
        sql+= " (select 专业名称 from 专业 where id=SUBSTRING(a.id,1,4)+'0000') end as name,";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql+= " (select 专业名称 from 专业 where id=SUBSTRING(a.id,1,6)+'00') end as name,";
    } else {
        sql+= " (select 专业名称 from 专业 where id=a.id) end as name,";
    }

    sql += "  case when c.年龄 <= 30 then 1 else 0 end as age20,";
    sql += "  case when c.年龄 > 30  and  c.年龄 <=40 then 1 else 0 end as age30,";
    sql += "  case when c.年龄 > 40  and  c.年龄 <=50 then 1 else 0 end as age40,";
    sql += "  case when c.年龄 > 50  and  c.年龄 <=60 then 1 else 0 end as age50,";
    sql += "  case when c.年龄 > 60  and  c.年龄 <=70 then 1 else 0 end as age60,";
    sql += "  case when c.年龄 > 70  then 1 else 0 end as age70";
    sql += "  from 专家专业关联 as b";
    sql += "  LEFT JOIN 专业 a on a.id=b.专业id";
    sql += "  LEFT JOIN 专家 c on b.专家id=c.id";
    sql += "  where a.专业状态=1 AND c.逻辑状态 = 0 ";
    if (query && query.id.substr(4, 4) === "0000") {
        sql += " AND SUBSTRING(a.父专业ID,1,4)='"+query.id.substr(0, 4)+"'";

    }else if (query && query.id.substr(6, 2) === "00") {
        sql += " AND SUBSTRING(a.父专业ID,1,6)='"+query.id.substr(0, 6)+"'";
    }else if(query && query.id !== "0" && query.id.substr(query.id.length-1, 2) !=='00'){
        sql += " AND SUBSTRING(a.父专业ID,1,"+query.id.length+")='"+query.id+"'";
    }
   // sql+="  AND a.id <> '"+query.id+"'";
    sql += "  ) as temp";
    if (query && query.id === "0") {
        sql += "  group by SUBSTRING(tid,1,4),name order by total DESC";
    } else if (query && query.id.substr(4, 4) === "0000") {
        sql += "  group by SUBSTRING(tid,1,6),name order by total DESC";
    } else {
        sql += "  group by tid,name order by total DESC";
    }


    db.DataQuery(sql).then(function (data) {
        if (!data) {
            logger.debug(sql);
            data = [];
        }
        var result = {};
        if (query.id === "0") {
            result = {
                total: data.length,
                rows: data.slice(pageSize*(pageNumber-1),pageSize*pageNumber)
            };
        } else {
            result = data;
        }

        res.send(result);
    }, function (err) {
        res.send(err);
    }).catch(function (err) {
        res.send(err);
        console.log("err:", err);
    });

    /*  if (query.id === "0") {
     res.send({"total": "3", "rows": [
     { "id": "1", "parentId": "0", "name": "Computers", "age20": 4, "total": 10, "age30": 1, "state": "closed"},
     {"id": "2", "parentId": "0", "name": "Electronics", "age20": 5, "total": 11, "age30": 2, "state": "closed"},
     {"id": "3", "parentId": "0", "name": "Sporting", "age20": 6, "total": 12, "age30": 3, "state": "closed"}
     ]});
     } else if(query.id === "1") {
     res.send([
     {"id": "11", "parentId": "1", "name": "Computers1", "age20": 4, "total": 10, "age30": 1, "state": "closed"},
     { "id": "12", "parentId": "1", "name": "Electronics1", "age20": 5, "total": 11, "age30": 2, "state": "closed"},
     { "id": "13", "parentId": "1", "name": "Sporting1", "age20": 6, "total": 12, "age30": 3, "state": "closed"}
     ]);
     }else if(query.id === "11") {
     res.send([
     {"id": "111", "parentId": "11", "name": "Computers11", "age20": 4, "total": 10, "age30": 1, "state": "open"},
     { "id": "112", "parentId": "11", "name": "Electronics11", "age20": 5, "total": 11, "age30": 2, "state": "open"},
     { "id": "113", "parentId": "11", "name": "Sporting11", "age20": 6, "total": 12, "age30": 3, "state": "open"}
     ]);
     }else{
     res.send([]);
     }*/

}

module.exports = {
    test: test,
    zhuanyefenbu: zhuanyefenbu,
    zynl: zynl
}