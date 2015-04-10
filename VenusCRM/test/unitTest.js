var vows = require("vows");
var assert = require("assert");
var request = require("request");
var url = "http://192.168.0.114:3001";

function assertError() {
	return function(error, response, body) {
		assert.isNull(error);
	};
}

function assertReturnHtml() {
	return function(error, response, body) {
		assert.isNull(body);
	};
}

function assertReturnJson() {
	return function(error, response, body) {
		//console.log(body);
		assert.isObject(body,'返回值应该是json对象！');
	};
}

function assertStatus(code) {
	return function(error, response, body) {

		if (response == undefined) {
			assert.isNull(!response);
		} else if (body && /404\.jpg/.test(body)) {
			assert.equal(404, code);
		} else {
			assert.equal(response.statusCode, code);
		}
	};
}

var api = {
	get: function(path) {
		return function() {
			request.get(url + path, this.callback);
		};
	},
	post: function(path, prams) {
		return function() {
			request.post(url + path, {
				form: prams
			}, this.callback);
		};
	}
};

var urltest = vows.describe('urltest');

urltest.addBatch({
	'访问登陆页面->': {
		topic: api.get('/login'),
		'是否发生错误:': assertError(),
		'返回状态是否为200:': assertStatus(200),
		'向首登陆页提交数据->': {
			topic: api.post('/login', {
				username: 'admin',
				password: 'password',
				exten: '8001'
			}, this.callback),
			'是否发生错误:': assertError(),
			'返回状态是否为302:': assertStatus(302),
			'访问首页->': {
				topic: api.get('/'),
				'是否发生错误:': assertError(),
				'返回状态是否为200:': assertStatus(200)
			}
			//'检查登陆结果': assertReturn()
		}
	},
	'访问用户管理页面->': {
		topic: api.get('/mamage/test '),
		'是否发生错误:': assertError(),
		'返回状态是否为200:': assertStatus(200)
	},
	'访问首页->': {
		topic: api.get('/'),
		'是否发生错误:': assertError(),
		'返回状态是否为200:': assertStatus(200)
	}


});

urltest.addBatch({
	'访问中继管理列表页面->': {
		topic: api.get('/pbx/Trunk'),
		'是否发生错误:': assertError(),
		'返回状态是否为200:': assertStatus(200),
		'删除中继->': {
			topic: api.post('/pbx/Trunk/delete', {
				id: '1'
			}, this.callback),
			'是否发生错误:': assertError(),
			'返回状态是否为200:': assertStatus(200),
			'删除结果是否为JSON:': assertReturnJson()

		}
	}

});

urltest.run();