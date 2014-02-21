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