var pbxIvrInputs=schema.define('pbxIvrInputs',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	general:   {type:Number,default: function () {return 0;}},//0,普通按键；1，默认响应
	generaltype:   {type:String,length:50},//错误响应：包括无效按键或等待按键超时标识或重试次数设置【timeout,invalidkey,retry】
	generalargs:   {type:String,length:150},//错误响应参数
	inputnum:   {type: String,length:10},
	gotoivrnumber:   {type: String,length:50},
	gotoivractid:   {type: String,length:100,default: function () {return '1';}}
});



pbxIvrInputs.Name='pbxIvrInputs';
schema.models.pbxIvrInputs;
exports.pbxIvrInputs = pbxIvrInputs;
Dbs.pbxIvrInputs = pbxIvrInputs;