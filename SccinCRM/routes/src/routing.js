var routes = {};

function authentication(req, res, next) {

	/*	if (!req.session.user) {

		req.session.error = '请先登陆';

		return res.redirect('/login');
	}*/

	next();

}
module.exports = routes;

routes.index = [{
		urlreg: '/',
		file: '/index',
		method: 'get',
		fn: 'get'
	},
	{
		urlreg: '/',
		file: '/index',
		method: 'post',
		fn: 'post'
	}
];

routes.login = [{
		urlreg: '/login',
		file: '/login',
		method: 'get',
		fn: 'get'
	},
	{
		urlreg: '/login',
		file: '/login',
		method: 'post',
		fn: 'post'
	}
];


routes.autoDial = [{
	urlreg: '/autoDial',
		file: '/autoDial',
		method: 'all',
		fn: 'all'
	}
];


routes.builddbdata = [{
	urlreg: '/builddbdata',
	file: '/builddbdata',
	method: 'get',
	fn: 'get'
}];

routes.pagination=[{
	urlreg: '/pagination',
	file: '/pagination',
	method: 'post',
	fn: 'post'
}];

routes.PBXExtension=[{
	urlreg: '/PBXExtension',
	file: '/PBXExtension',
	method: 'all',
	fn: 'list'
},
{
	urlreg: '/PBXExtension/create',
	file: '/PBXExtension',
	method: 'get',
	fn: 'create'
},
{
	urlreg: '/PBXExtension/edit',
	file: '/PBXExtension',
	method: 'get',
	fn: 'edit'
},
{
	urlreg: '/PBXExtension/delete',
	file: '/PBXExtension',
	method: 'post',
	fn: 'delete'
},
{
	urlreg: '/PBXExtension/save',
	file: '/PBXExtension',
	method: 'post',
	fn: 'save'
},
{
	urlreg: '/PBXExtension/checkAjax',
	file: '/PBXExtension',
	method: 'post',
	fn: 'checkAjax'
}
];
routes.PBXExtenGroup=[{
	urlreg: '/PBXExtenGroup',
	file: '/PBXExtenGroup',
	method: 'all',
	fn: 'list'
},{
	urlreg: '/PBXExtenGroup/save',
	file: '/PBXExtenGroup',
	method: 'post',
	fn: 'save'
},{
	urlreg: '/PBXExtenGroup/delete',
	file: '/PBXExtenGroup',
	method: 'post',
	fn: 'delete'
}];
routes.PBXQueue=[{
	urlreg: '/PBXQueue',
	file: '/PBXQueue',
	method: 'all',
	fn: 'list'
},{
	urlreg: '/PBXQueue/create',
	file: '/PBXQueue',
	method: 'get',
	fn: 'create'
},{
	urlreg: '/PBXQueue/edit',
	file: '/PBXQueue',
	method: 'get',
	fn: 'edit'
},{
	urlreg: '/PBXQueue/save',
	file: '/PBXQueue',
	method: 'post',
	fn: 'save'
},{
	urlreg: '/PBXQueue/delete',
	file: '/PBXQueue',
	method: 'post',
	fn: 'delete'
},
{
	urlreg: '/PBXQueue/checkAjax',
	file: '/PBXQueue',
	method: 'post',
	fn: 'checkAjax'
}];
routes.PBXTrunk=[{
	urlreg: '/PBXTrunk',
	file: '/PBXTrunk',
	method: 'all',
	fn: 'list'
},{
	urlreg: '/PBXTrunk/create',
	file: '/PBXTrunk',
	method: 'get',
	fn: 'create'
},{
	urlreg: '/PBXTrunk/edit',
	file: '/PBXTrunk',
	method: 'get',
	fn: 'edit'
},{
	urlreg: '/PBXTrunk/save',
	file: '/PBXTrunk',
	method: 'post',
	fn: 'save'
},{
	urlreg: '/PBXTrunk/delete',
	file: '/PBXTrunk',
	method: 'post',
	fn: 'delete'
},
{
	urlreg: '/PBXTrunk/checkAjax',
	file: '/PBXTrunk',
	method: 'post',
	fn: 'checkAjax'
}];

routes.PBXCard=[{
	urlreg: '/PBXCard',
	file: '/PBXCard',
	method: 'all',
	fn: 'list'
},{
	urlreg: '/PBXCard/save',
	file: '/PBXCard',
	method: 'post',
	fn: 'save'
},{
	urlreg: '/PBXCard/delete',
	file: '/PBXCard',
	method: 'post',
	fn: 'delete'
}];

routes.asami = [{
		urlreg: '/asami/getconfig',
		file: '/asami',
		method: 'all',
		fn: 'getconfig'
	},{
		urlreg: '/asami/getconfigjson',
		file: '/asami',
		method: 'all',
		fn: 'getconfigjson'
	},{
		urlreg: '/asami/createconfig',
		file: '/asami',
		method: 'all',
		fn: 'createconfig'
	},

	{
		urlreg: '/asami/coreshowchannels',
		file: '/asami',
		method: 'all',
		fn: 'coreshowchannels'
	},

	{
		urlreg: '/asami/extensionstate',
		file: '/asami',
		method: 'all',
		fn: 'extensionstate'
	},

	{
		urlreg: '/asami/command',
		file: '/asami',
		method: 'all',
		fn: 'command'
	}, {
		urlreg: '/asami/status',
		file: '/asami',
		method: 'all',
		fn: 'status'
	}, {
		urlreg: '/asami/hangup',
		file: '/asami',
		method: 'all',
		fn: 'hangup'
	}, {
		urlreg: '/asami/DadOn',
		file: '/asami',
		method: 'all',
		fn: 'DadOn'
	}, {
		urlreg: '/asami/transfer',
		file: '/asami',
		method: 'all',
		fn: 'transfer'
	}, {
		urlreg: '/asami/packCall',
		file: '/asami',
		method: 'all',
		fn: 'packCall'
	}, {
		urlreg: '/asami/unPark',
		file: '/asami',
		method: 'all',
		fn: 'unPark'
	}, {
		urlreg: '/asami/checkService',
		file: '/asami',
		method: 'all',
		fn: 'checkService'
	},

	{
		urlreg: '/asami/GetCallInfo',
		file: '/asami',
		method: 'all',
		fn: 'GetCallInfo'
	},

	{
		urlreg: '/asami/hangupexten',
		file: '/asami',
		method: 'all',
		fn: 'hangupexten'
	},

	{
		urlreg: '/asami/ping',
		file: '/asami',
		method: 'all',
		fn: 'ping'
	}, {
		urlreg: '/asami/dialout',
		file: '/asami',
		method: 'all',
		fn: 'dialout'
	}, {
		urlreg: '/asami/sippeers',
		file: '/asami',
		method: 'all',
		fn: 'sippeers'
	}, {
		urlreg: '/asami/autodial',
		file: '/asami',
		method: 'all',
		fn: 'autodial'

	}, {
		urlreg: '/asami/getresult',
		file: '/asami',
		method: 'all',
		fn: 'getresult'

	}

];