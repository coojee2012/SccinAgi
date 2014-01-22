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
		file: '/routes/index',
		method: 'get',
		fn: 'get'
	},

	{
		urlreg: '/',
		file: '/routes/index',
		method: 'post',
		fn: 'post'
	}
];

routes.asami = [{
		urlreg: '/asami/getconfig',
		file: '/routes/asami',
		method: 'all',
		fn: 'getconfig'
	},

	{
		urlreg: '/asami/getconfigjson',
		file: '/routes/asami',
		method: 'all',
		fn: 'getconfigjson'
	},

	{
		urlreg: '/asami/createconfig',
		file: '/routes/asami',
		method: 'all',
		fn: 'createconfig'
	},

	{
		urlreg: '/asami/coreshowchannels',
		file: '/routes/asami',
		method: 'all',
		fn: 'coreshowchannels'
	},

	{
		urlreg: '/asami/extensionstate',
		file: '/routes/asami',
		method: 'all',
		fn: 'extensionstate'
	},

	{
		urlreg: '/asami/command',
		file: '/routes/asami',
		method: 'all',
		fn: 'command'
	}, {
		urlreg: '/asami/status',
		file: '/routes/asami',
		method: 'all',
		fn: 'status'
	}, {
		urlreg: '/asami/hangup',
		file: '/routes/asami',
		method: 'all',
		fn: 'hangup'
	}, {
		urlreg: '/asami/DadOn',
		file: '/routes/asami',
		method: 'all',
		fn: 'DadOn'
	}, {
		urlreg: '/asami/transfer',
		file: '/routes/asami',
		method: 'all',
		fn: 'transfer'
	}, {
		urlreg: '/asami/packCall',
		file: '/routes/asami',
		method: 'all',
		fn: 'packCall'
	}, {
		urlreg: '/asami/unPark',
		file: '/routes/asami',
		method: 'all',
		fn: 'unPark'
	}, {
		urlreg: '/asami/checkService',
		file: '/routes/asami',
		method: 'all',
		fn: 'checkService'
	},

	{
		urlreg: '/asami/GetCallInfo',
		file: '/routes/asami',
		method: 'all',
		fn: 'GetCallInfo'
	},

	{
		urlreg: '/asami/hangupexten',
		file: '/routes/asami',
		method: 'all',
		fn: 'hangupexten'
	},

	{
		urlreg: '/asami/ping',
		file: '/routes/asami',
		method: 'all',
		fn: 'ping'
	}, {
		urlreg: '/asami/dialout',
		file: '/routes/asami',
		method: 'all',
		fn: 'dialout'
	}, {
		urlreg: '/asami/sippeers',
		file: '/routes/asami',
		method: 'all',
		fn: 'sippeers'
	}

];