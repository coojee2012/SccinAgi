/**
 * Created by LinYong on 2015-01-26.
 */

function test(req,res,next,db,logger){
    db.DataQuery("SELECT TOP 2 * FROM SyncOutToIn ORDER BY CreateTime DESC").then(function (data) {
        res.send({success:true,msg:"IN TEST FUNCTION",data:data});
    }, function (err) {
        throw err;
    }).catch(function (err) {
        console.log("err:", err);
    });
}

module.exports={
    test:test
}