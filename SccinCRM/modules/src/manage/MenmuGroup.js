var manageMenmuGroup=schema.define('manageMenmuGroup',{
    id:{type:String,length:100,default:function(){return guid.create();}},
    groupName:   {type:String,length:50},
    crtTime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});



manageMenmuGroup.validatesPresenceOf('groupName');//验证非空

manageMenmuGroup.Name='manageMenmuGroup';
schema.models.manageMenmuGroup;
exports.manageMenmuGroup = manageMenmuGroup;
Dbs.manageMenmuGroup = manageMenmuGroup;