var webshopSettings = function () {

	this.pictures = {
		//100: '100x100', 
		150: '150x150', 
		450: '450x450', 
		//500: '500x500'
	};

	this.consoleColors = {
		silly: 'rainbow',
		input: 'grey',
		verbose: 'cyan',
		prompt: 'grey',
		info: 'green',
		data: 'grey',
		help: 'cyan',
		warn: 'yellow',
		debug: 'blue',
		error: 'red'
	};

	this.databaseSettings = {
		'url' : 'mongodb://127.0.0.1:27017/mijnSexShop'
		/*
	  client: 'mysql',
	  connection: {
	    host     : '127.0.0.1',
	    user     : 'mijnsexshop',
	    password : 'password',
	    database : 'mijnsexshop'
	  }
	  //,debug:true*/
	};

};

module.exports = (new webshopSettings);
