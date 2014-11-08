var colors              = require('colors');
var nodeFile            = 'webShop.js';

var httpPort            = 9001;
var express             = require('express');

var compression         = require('compression');
var app                 = express();

var http                = require('http').createServer(app);
var fs                  = require('fs');
var webshopSettings     = require('./admin_modules/settings');
var webshop             = require('./admin_modules/webshop');

var webshopInitSettings = {
	db: webshopSettings.databaseSettings,
	pictures: webshopSettings.pictures,
	appDir: __dirname
};


colors.setTheme(webshopSettings.consoleColors);
webshop.init(webshopInitSettings);

app.use(compression({
  threshold: 512
}))

app.get('*.(css|js|woff|ttf|svg|eot)', function (req, res) {

	var url = __dirname + req.url;

	if (url.indexOf('?') !== -1) {
		url = url.split('?')[0];
	}
	
	fs.readFile(url, function (err, data) {
		console.log('error', err);
		if (err) {
			console.log(err, 'not found ');
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('404 file not found');
			res.end();
			return;
		}

		var headers = {};

		switch (url.split('.').pop()) {
			case 'css' :
				headers['Content-Type'] = 'text/css';
			break;
			case 'js' :
				headers['Content-Type'] = 'text/javascript';
			break;
			case 'woff' :
				headers['Content-Type'] = 'application/x-font-woff';
			break;
			case 'ttf' :
				headers['Content-Type'] = 'application/octet-stream';
			break;
			case 'svg' :
				headers['Content-Type'] = 'image/svg+xml';
			break;
			case 'eot' :
				headers['Content-Type'] = 'font/otf';
			break;
			default:
				console.log('unkown file type');
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.write('404 file not found');
				res.end();
				return;
		}

		res.writeHead(200, headers);
		res.write(data);
		res.end();
	});
});

app.get('/', function (req, res) {

	var url = (req.url === '/' ? 'index.html' : req.url);
	fs.readFile(url, function (err, data) {
		if (err) {
			console.log(err, 'not found ');
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('404 file not found');
			res.end();
			return;
		}


		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data);
		res.end();
	});
});

app.listen(httpPort, function () {
	console.log('server is running on %s'.info, httpPort);
});