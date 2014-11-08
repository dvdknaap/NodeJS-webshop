var colors              = require('colors');
var nodeFile            = 'webshopApi.js';

var httpPort            = 9002;
var restify             = require('restify');
var server              = restify.createServer();

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


server.get('menu/getAll', function (req, res, next) {

	console.log(req.params, 'req.params');
  	res.send('hello ' + req.params.name);
	next();
});

server.get('mainCats/getAll', function (req, res, next) {

	console.log(req.params, 'req.params');
  	res.send('hello ' + req.params.name);
	next();
});

server.listen(httpPort, function() {
	console.log('%s listening at %s', server.name, server.url);
});