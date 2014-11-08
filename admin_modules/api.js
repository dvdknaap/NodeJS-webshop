var api = function api() {
	var apiRequest = {};


	this.init = function init(req, res, webshop) {

		apiRequest = {
			req: req,
			res: res,
			webshop: webshop
		}

		return parseRequest();
	};

	var parseRequest = function parseRequest() {
		var req = apiRequest.req;
		var res = apiRequest.res;

		console.log(req, 'req');

		console.log('%s %s %s', req.method, req.url, req.path);
		res.end();
	};

};

module.exports = (new api());