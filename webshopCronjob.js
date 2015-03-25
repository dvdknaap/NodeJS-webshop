#!/usr/bin/env node
var http            = require('http');
var colors          = require('colors');
var nodeFile        = 'webShop.js';
var program         = require('commander');
var webshop         = require('./admin_modules/webshop');
var webshopSettings = require('./admin_modules/settings');

var webshopInitSettings = {
	db: webshopSettings.databaseSettings,
	pictures: webshopSettings.pictures,
	appDir: __dirname
};

colors.setTheme(webshopSettings.consoleColors);
webshop.init(webshopInitSettings);

program
	.version('0.0.1')
	.usage('Type ./'+nodeFile+' -h for help')
	.option('-c, --create', 'create webshop tables')
	.option('-a, --all', 'Recieve all products')
	.option('-n, --new', 'Recieve new products')
	.option('-s, --stock', 'Recieve products stock')
	.option('-r, --removed', 'Receive all removed products')
	.option('-d, --downloadPictures', 'download pictures')
	.parse(process.argv)
;

if (program.create) {
	webshop.connectMongoDb(webshop.createTables);

} else if (program.all) {

	webshop.connectMongoDb(webshop.getAllProducts);
} else if (program.stock) {

	webshop.connectMongoDb(webshop.getProductStocks);
} else if (program.new) {
	webshop.connectMongoDb(webshop.getNewProducts);

} else if (program.removed) {

	webshop.connectMongoDb(webshop.getRemovedProducts);
} else if (program.downloadPictures) {

	webshop.connectMongoDb(webshop.downloadProductPictures);

} else {
	program.help();
}

//process.exit(1);
