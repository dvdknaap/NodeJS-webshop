var webshop = function webshop() {	
	var format          = require('util').format;
	var download        = require('./download');
	var queue           = require('./queue');
	var xmlreader       = require('xmlreader');
	var downloaded      = {};
	var fs              = require('fs');
	var mongodb         = require('mongodb').MongoClient;
	var maxFileTime     = 86400;
	var webshopSettings = { db: {}, pictures: {}, appDir: ''};

	this.init = function init(settings, nodeFile, program) {
		mergeSettings(settings);
	};

	this.connectMongoDb = function (callback) {

	  mongodb.connect(webshopSettings.db.url, function(err, db) {
	    if(err) throw err;

	    callback.call(db);
	  })
	};

	var mergeSettings = function mergeSettings(settings) {
		for(var setting in webshopSettings) {
			if (settings[setting] !== undefined) {
				webshopSettings[setting] = settings[setting];
			}
		}
	};

	var checkProducts = function checkProducts(done, jobName, db, data) {

    var collection = db.collection('products');

		collection.findOne({
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			barcode: data.barcode
		}, function(error, result) {

			if (error) {
				throw new Error('checkMainCats error: '+error);
			}

		  if (result) {
		  	if (data['_id'] === undefined) {
		  		data['_id'] = result[0]['_id'];
		  	}

				updateProduct(done, jobName, db, data);
		  } else {
				insertProduct(done, jobName, db, data);
			}
		});
	};

	var insertProduct = function insertProduct(done, jobName, db, data) {

	  //Insert
	  var collection = db.collection('products');
		collection.insert(data, function(err, docs) {
      
      collection.count(function(err, count) {
        console.log(format("count = %s", count));
	  		done();
      });
    });
	};

	var updateProduct = function updateProduct(done, jobName, db, data, update) {

		var where = {};

		if (update === undefined) {

			if (data['_id'] === undefined || !data['_id']) {
				throw new Error('No product _id');
				return;
			}

			where['_id'] = data['_id'];

			delete data['_id'];

		} else {
			where = update;
		}

	  var collection = db.collection('products');
		collection.update(where, {$set: data}, {w:1}, function(err, docs) {
      
      collection.count(function(err, count) {
        console.log(format("count = %s", count));
	  		done();
      });
    });
	};

	//Mark products as removed not remove them
	var removeProduct = function removeProduct(done, jobName, db, data) {

		if (data.sku === undefined || !data.sku) {
			throw new Error('No product sku');
			return;
		}

		var productUpdate = data;

		delete productUpdate.sku;

		//Update
	  	knex('products').where('sku', '=', data.sku).update(productUpdate).then(function removedProduct(results) {
	  		done();
	  	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex removed chain error', e);
		  done();
		});
	};

	var checkMainCats = function checkMainCats(done, jobName, db, data) {

		if (data.mainCatId === undefined || !data.mainCatId) {
			throw new Error('No mainCatId');
			return;
		}

		var collection = db.collection('mainCats');

		collection.findOne({
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			mainCatId: data.mainCatId
		}, function(error, result) {

			if (error) {
				throw new Error('checkMainCats error: '+error);
			}

		  if (result) {
		  	done();
		  } else {
				insertMainCat(done, jobName, db, data);
		  }
		});		
	};

	var insertMainCat = function insertMainCat(done, jobName, db, data) {

	  //Insert
	  var collection = db.collection('mainCats');
		collection.insert({
			mainCatId: data.mainCatId,
			mainCatTitle: data.mainCat,
			mainCatDesc: data.mainCat,
			name: data.mainCat,
			desc: data.mainCat,
			created: (new Date())
		}, function(err, docs) {
      
      collection.count(function(err, count) {
        console.log(format("count = %s", count));
	  		done();
      });
    });
	};

	var checkSubCats = function checkSubCats(done, jobName, db, data) {
		
		if (data.subCatId === undefined || !data.subCatId) {
			throw new Error('No subCatId');
			return;
		}

		var collection = db.collection('subCats');

		console.info({
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			subCatid: data.subCatId
		}, 'check');
		collection.findOne({
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			subCatid: data.subCatId
		}, function(error, result) {
			if (error) {
				throw new Error('checkSubCats error: '+error);
			}

			console.info(arguments, 'arguments');
			return;

		  if (result) {
		  	done();
		  } else {
				insertSubCat(done, jobName, db, data);
		  }
		});
	};

	var insertSubCat = function insertSubCat(done, jobName, db, data) {

	  //Insert
	  var collection = db.collection('subCats');
		collection.insert({
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			subCatTitle: data.subCat,
			subCatDesc: data.subCat,
			name: data.subCat,
			desc: data.subCat,
			created: (new Date())
		}, function(err, docs) {
      
      collection.count(function(err, count) {
        console.log(format("count = %s", count));
	  		done();
      });
    });
	};

	var checkBrands = function checkBrands(done, jobName, db, data) {

		if (data.brand === undefined || !data.brand) {
			throw new Error('No brand');
			return;
		}

		var collection = db.collection('brands');

		collection.findOne({
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			brand: data.brand
		}, function(error, result) {
			if (error) {
				throw new Error('checkSubCats error: '+error);
			}

		  if (result) {
		  	done();
		  } else {
				insertBrand(done, jobName, db, data);
		  }
	  });
	};

	var insertBrand = function insertBrand(done, jobName, db, data) {

	  //Insert
	  var collection = db.collection('brands');
		collection.insert({
			brand: data.brand,
			title: data.brand,
			desc: data.brand,
			created: (new Date())
		}, function(err, docs) {
      
      collection.count(function(err, count) {
        console.log(format("count = %s", count));
	  		done();
      });
    });

	};	

	//Create tables
	this.createTables = function () {
		var created      = 0;
		var totalTries   = 0;
		var totalCreated = 6;
		var ctx          = this;


		//Script has to exit when completed
		setTimeout(function () {
			queue.add('Exit script', process.exit, [ 1 ]);
			queue.run();
		}, 30000);

    this.createCollection('brands', function(err, collection) {    	
			if (err) {
				console.error(err, 'error brands');
			} else {
				++created;
			}

			++totalTries;
    });

    this.createCollection('mainCats', function(err, collection) {
    	
			if (err) {
				console.error(err, 'error mainCats');
			} else {
				++created;
			}

			++totalTries;
    });

    this.createCollection('subCats', function(err, collection) {
    	
			if (err) {
				console.error(err, 'error subCats');
			} else {
				++created;
			}

			++totalTries;
    });

    this.createCollection('customers', function(err, collection) {
    	
			if (err) {
				console.error(err, 'error customers');
			} else {
				++created;
			}

			++totalTries;
    });

    this.createCollection('shoppingCart', function(err, collection) {
    	
			if (err) {
				console.error(err, 'error shoppingCart');
			} else {
				++created;
			}

			++totalTries;
    });

    this.createCollection('products', function(err, collection) {
    	
			if (err) {
				console.error(err, 'error products');
			} else {
				++created;
			}

			++totalTries;

			if (totalTries === totalCreated) {
				console.info('close');


    		console.info(created, 'created totalTries:'+totalTries);
				ctx.close();
			}
    });

	};

	this.getAllProducts = function getAllProducts() {
		
		var remoteFile    = 'http://graphics.edc-internet.nl/b2b_feed.php?key=155223092395BK6Z952BRR52H13H0213&sort=xml&type=xml&lang=nl';
		var localFileName = 'all.xml';
		var localFile     = webshopSettings.appDir+'/tmp/'+localFileName;
		var ctx           = this;

		function callbackXml(done, job, remoteFile, localFile, picture) {

			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				console.info('downloaded: localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
				queue.add('Parse '+localFile, parseAllProducts, [ctx, localFile]);
				done();
				queue.run();
			});

			download.on('error', function error(error) {
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
				done();
			});

			download.downloadFile(remoteFile, localFile);
		};

	 //fs.unlink(localFile);

		fs.exists(localFile, function exists(exists) {
			console.log(localFile+' exists %s'.debug, exists);

			if (!exists) {
				queue.add('Downloading '+localFile, callbackXml, [ctx, remoteFile, localFile]);
				queue.add('Parse '+localFile, parseAllProducts, [ctx, localFile]);
				queue.run();
				return;
			}

			fs.stat(localFile, function stat(err, stats) {
				if (err) {
					console.log('getAllProducts err: %s '.error, err);
			    	queue.add('Exit process', process.exit, [1]);
			    	queue.run();
					return;
				}

				var now = (new Date()).getTime()/1000;

				if (stats.size == 0 || now-(new Date(stats.mtime)).getTime()/1000 > maxFileTime) {

					queue.add('Downloading '+localFile, callbackXml, [ctx, remoteFile, localFile]);
					queue.add('Parse '+localFile, parseAllProducts, [ctx, localFile]);
				} else {
					queue.add('Parse '+localFile, parseAllProducts, [ctx, localFile]);
				}

				queue.run();
			});
		});
	};

	var parseAllProducts = function parseAllProducts(done, jobName, db, localFile) {

		fs.exists(localFile, function exists(exists) {
			if (!exists) {
				console.log('parseAllProducts err: %s '.error, err);
				queue.add('Exit process', process.exit, [1]);
				done();
				return;
			}

			fs.readFile(localFile, function readFile(err, data) {
				if (err) {
					console.log('parseAllProducts err: %s '.error, err);
					queue.add('Exit process', process.exit, [1]);
					done();
					return;
				}

				xmlreader.read(data.toString().replace('<?xml version="1.0" encoding="UTF-8"?>', ''),
				  function parsedXml(err, data) {
				  	if (err) {
				  		console.error('Error: %s'.error, err);
				    	queue.add('Exit process', process.exit, [1]);
							done();
				  		return;
				  	}

				  	var totalProducts =  data.producten.product.count();
				  	var getProductText = function getProductText(data) {
				  		if (typeof data.text === 'function') {
				  			return data.text();
				  		}

				  		return '';
				  	};

					data.producten.product.each(function (i, product) {

						var productData = {
							'sku' : getProductText(product.artikelnummer),  
							'subSku' : getProductText(product.subartikelnummer),  
							'title' : getProductText(product.titel),  
							'brand' : getProductText(product.merk),  
							'buyPrice' : getProductText(product.actieprijs), 
							//'discountPrice' : getProductText(product.inkoopprijs),  
							'sellPrice' : getProductText(product.adviesprijs),  
							'mainCatId' : getProductText(product.hoofdcatid),  
							'mainCat' : getProductText(product.hoofdcategorie),  
							'subCatId' : getProductText(product.catid),  
							'subCat' : getProductText(product.categorie),  
							'stock' : getProductText(product.voorraad),  
							'weekNr' : getProductText(product.weeknummer),  
							'vat' : getProductText(product.btw),  
							'size' : getProductText(product.maat),  
							'weight' : getProductText(product.gewicht),  
							'freeOfPlasticizers' : getProductText(product.weekmakervrij),  
							'battery' : getProductText(product.batterij),  
							'batteryType' : getProductText(product.batterijtype), 
							'colour' : getProductText(product.kleur), 
							'waterproof' : getProductText(product.waterproof), 
							'material' : getProductText(product.materiaal), 
							'length' : getProductText(product.lengte), 
							'diameter' : getProductText(product.diameter), 
							'control' : getProductText(product.bediening), 
							'vibration' : getProductText(product.vibratie), 
							'power' : getProductText(product.power), 
							'washingTemperature' : getProductText(product.wastemperatuur), 
							'bleaching' : getProductText(product.bleken), 
							'ironing' : getProductText(product.strijken), 
							'chemicalCleaning' : getProductText(product.chemischr), 
							'clothesDryer' : getProductText(product.droogtrommel),  
							'fit' : getProductText(product.pasvorm), 
							'changed' : getProductText(product.gewijzigd), 
							'description' : getProductText(product.omschrijving), 
							'mainPicture' : 'img/product/150/'+getProductText(product.artikelnummer)+'.jpg', 
							'discount' : getProductText(product.korting), 
							'remaining' : getProductText(product.uitlopend), 
							'barcode' : getProductText(product.barcode), 
							//'numPictures' : getProductText(product.aantalfotos), 
							'video' : getProductText(product.video), 
							'lxbxh' : getProductText(product.lxbxh), 
							'censorpic' : getProductText(product.censuurfoto)
						};

						queue.add('check mainChats '+i, checkMainCats, [db, productData]);
						queue.add('check subCats '+i, checkSubCats, [db, productData]);
						queue.add('check brands '+i, checkBrands, [db, productData]);
						queue.add('insert product '+i, checkProducts, [db, productData]);
					});

				    //Delete data
				    delete data;

			  		console.log('totalProducts %s'.info, totalProducts);

				    queue.add('Exit process', process.exit, [1]);
						done();
				  }
				);
			});		
		});
	};

	//Received all product stocks
	this.getProductStocks = function getProductStocks() {

		var remoteFile    = 'https://www.erotischegroothandel.nl/downloads/eg_xml_feed_stock.xml';
		var localFileName = 'stock.xml';
		var localFile     = webshopSettings.appDir+'/tmp/'+localFileName;
				
		function callbackXml(done, job, remoteFile, localFile, picture) {
			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				console.info('downloaded: localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
				queue.add('Parse '+localFile, parseProductStocks, [localFile]);
				done();
			});

			download.on('error', function error(error) {
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
				done();
			});

			download.downloadFile(remoteFile, localFile);
		};

		fs.exists(localFile, function exists(exists) {
			if (!exists) {
				queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
				queue.add('Parse '+localFile, parseProductStocks, [localFile]);
				queue.run();
				return;
			}

			fs.stat(localFile, function stat(err, stats) {
				if (err) {
					console.log('getProductStocks err: %s '.error, err);
			    	queue.add('Exit process', process.exit, [1]);
			    	queue.run();
					return;
				}

				var now = (new Date()).getTime()/1000;

				if (stats.size == 0 || now-(new Date(stats.mtime)).getTime()/1000 > maxFileTime) {
					queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
					queue.add('Parse '+localFile, parseProductStocks, [localFile]);
				} else {
					queue.add('Parse '+localFile, parseProductStocks, [localFile]);
				}

				queue.run();
			});
		});
	};

	var parseProductStocks = function parseProductStocks(done, jobName, localFile) {

		fs.readFile(localFile, function readFile(err, data) {
			if (err) {
				console.log('parseProductStocks err: %s '.error, err);
		    	queue.add('Exit process', process.exit, [1]);
				done();
				return;
			}

			xmlreader.read(data.toString().replace('<?xml version="1.0" encoding="UTF-8"?>', ''),
			function parsedXml(err, data) {
				if (err) {
					console.error('Error: %s'.error, err);
					queue.add('Exit process', process.exit, [1]);
					done();
					return;
				}

				var totalProducts  =  data.producten.product.count();				
				var getProductText = function getProductText(data) {
					if (data.text !== undefined && typeof data.text === 'function') {
						return data.text();
					}

					return '';
				};


				data.producten.product.each(function (i, product) {

					var productData = {
						'stock' : getProductText(product.stock),
						'weekNr' : getProductText(product.week),
						'barcode' : getProductText(product.ean), 
					};

					var productWhere = {
						'subSku' : getProductText(product.productnr),
					};

					queue.add('update product '+i, updateProduct, [productData, productWhere]);

				});

			    //Delete data
			    delete data;

		  		console.log('totalProducts %s'.info, totalProducts);

			    queue.add('Exit process', process.exit, [1]);
				done();
		  	});
		});		
	};

	this.getNewProducts = function getNewProducts() {

		var remoteFile    = 'http://graphics.edc-internet.nl/b2b_feed.php?key=155223092395BK6Z952BRR52H13H0213&sort=xml&type=xml&lang=nl&new=1';
		var localFileName = 'new.xml';
		var localFile     = webshopSettings.appDir+'/tmp/'+localFileName;

		function callbackXml(done, job, remoteFile, localFile, picture) {
			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				console.info('downloaded: localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
				queue.add('Parse '+localFile, parseNewProducts, [localFile]);
				done();
			});

			download.on('error', function error(error) {
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
				done();
			});

			download.downloadFile(remoteFile, localFile);
		};

		fs.exists(localFile, function exists(exists) {
			if (!exists) {
				queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
				queue.run();
				return;
			}

			fs.stat(localFile, function stat(err, stats) {

				if (err) {
					console.log('getNewProducts err: %s '.error, err);
			    	queue.add('Exit process', process.exit, [1]);
			    	queue.run();
					return;
				}

				var now = (new Date()).getTime()/1000;

				if (stats.size == 0 || now-(new Date(stats.mtime)).getTime()/1000 > maxFileTime) {

					queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
					queue.add('Parse '+localFile, parseNewProducts, [localFile]);
				} else {
					queue.add('Parse '+localFile, parseNewProducts, [localFile]);
				}
				
				queue.run();
			});
		});
	};

	var parseNewProducts = function parseNewProducts(done, jobName, db, localFile) {

		fs.readFile(localFile, function readFile(err, data) {
			if (err) {
				console.log('parseNewProducts err: %s '.error, err);
		    queue.add('Exit process', process.exit, [1]);
				done();
				return;
			}

			xmlreader.read(data.toString().replace('<?xml version="1.0" encoding="UTF-8"?>', ''),
			  function parsedXml(err, data) {
			  	if (err) {
			  		console.error('Error: %s'.error, err);
			    	queue.add('Exit process', process.exit, [1]);
						done();
			  		return;
			  	}

			  	var totalProducts =  data.producten.product.count();
			  	var getProductText = function getProductText(data) {
			  		if (typeof data.text === 'function') {
			  			return data.text();
			  		}

			  		return '';
			  	};

				data.producten.product.each(function (i, product) {

					var productData = {
						'sku' : getProductText(product.artikelnummer),
						'subSku' : getProductText(product.subartikelnummer),
						'title' : getProductText(product.titel),
						'brand' : getProductText(product.merk),
						'buyPrice' : getProductText(product.actieprijs),  
						//'discountPrice' : getProductText(product.inkoopprijs),
						'sellPrice' : getProductText(product.adviesprijs),
						'mainCatId' : getProductText(product.hoofdcatid),
						'mainCat' : getProductText(product.hoofdcategorie),
						'subCatId' : getProductText(product.catid),
						'subCat' : getProductText(product.categorie),
						'stock' : getProductText(product.voorraad),
						'weekNr' : getProductText(product.weeknummer),
						'vat' : getProductText(product.btw),
						'size' : getProductText(product.maat),
						'weight' : getProductText(product.gewicht),
						'freeOfPlasticizers' : getProductText(product.weekmakervrij),
						'battery' : getProductText(product.batterij),
						'batteryType' : getProductText(product.batterijtype),  
						'colour' : getProductText(product.kleur),  
						'waterproof' : getProductText(product.waterproof),  
						'material' : getProductText(product.materiaal),  
						'length' : getProductText(product.lengte),  
						'diameter' : getProductText(product.diameter),  
						'control' : getProductText(product.bediening),  
						'vibration' : getProductText(product.vibratie),  
						'power' : getProductText(product.power),  
						'washingTemperature' : getProductText(product.wastemperatuur),  
						'bleaching' : getProductText(product.bleken),  
						'ironing' : getProductText(product.strijken),  
						'chemicalCleaning' : getProductText(product.chemischr),  
						'clothesDryer' : getProductText(product.droogtrommel),
						'fit' : getProductText(product.pasvorm),  
						'changed' : getProductText(product.gewijzigd),  
						'description' : getProductText(product.omschrijving),  
						'mainPicture' : 'img/product/150/'+getProductText(product.artikelnummer)+'.jpg', 
						'discount' : getProductText(product.korting),  
						'remaining' : getProductText(product.uitlopend),  
						'barcode' : getProductText(product.barcode),  
						//'numPictures' : getProductText(product.aantalfotos),  
						'video' : getProductText(product.video),  
						'lxbxh' : getProductText(product.lxbxh),  
						'censorpic' : getProductText(product.censuurfoto)
					};

					queue.add('check mainChats '+i, checkMainCats, [db, productData]);
					queue.add('check subCats '+i, checkSubCats, [db, productData]);
					queue.add('check brands '+i, checkBrands, [db, productData]);

					queue.add('insert product '+i, checkProducts, [db, productData]);
				});

	  		console.log('totalProducts %s'.info, totalProducts);

		    queue.add('Exit process', function () {

			 		//Delete data
			    delete data;
		    	process.exit;
		    }, [1]);

				done();
			});
		});		
	};

	this.getRemovedProducts = function getRemovedProducts() {

		var remoteFile    = 'http://graphics.edc-internet.nl/xml/deleted_products.xml';
		var localFileName = 'removed.xml';
		var localFile     = webshopSettings.appDir+'/tmp/'+localFileName;

		function callbackXml(done, job, remoteFile, localFile, picture) {
			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				console.info('downloaded: localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
				queue.add('Parse '+localFile, parseRemovedProducts, [localFile]);
				done();
			});

			download.on('error', function error(error) {
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
				done();
			});

			download.downloadFile(remoteFile, localFile);
		};

		fs.exists(localFile, function exists(exists) {
			if (!exists) {
				queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
				queue.run();
				return;
			}

			fs.stat(localFile, function stat(err, stats) {

				if (err) {
					console.log('getRemovedProducts err: %s '.error, err);
			    	queue.add('Exit process', process.exit, [1]);
			    	queue.run();
					return;
				}

				var now = (new Date()).getTime()/1000;

				if (stats.size == 0 || now-(new Date(stats.mtime)).getTime()/1000 > maxFileTime) {

					queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
					queue.add('Parse '+localFile, parseRemovedProducts, [localFile]);
				} else {
					queue.add('Parse '+localFile, parseRemovedProducts, [localFile]);
				}
				
				queue.run();
			});
		});
	};

	var parseRemovedProducts = function parseRemovedProducts(done, jobName, localFile) {

		fs.readFile(localFile, function readFile(err, data) {
			if (err) {
				console.log('parseRemovedProducts err: %s '.error, err);
		    	queue.add('Exit process', process.exit, [1]);
				done();
				return;
			}


			xmlreader.read(data.toString().replace('<?xml version="1.0" encoding="UTF-8"?>', ''), 
			  function parsedXml(err, data) {
			  	if (err) {
			  		console.error('Error: %s'.error, err);
			    	queue.add('Exit process', process.exit, [1]);
					done();
			  		return;
			  	}

				var totalProducts  =  data.products.product.count();				
				var getProductText = function getProductText(data) {
					if (data.text !== undefined && typeof data.text === 'function') {
						return data.text();
					}

					return '';
				};

				data.products.product.each(function (i, product) {

					var productData = {
						'deletedDate' : getProductText(product.date),
					};

					var productWhere = {
						'subSku' : getProductText(product.prnr),
					};

					queue.add('update product '+i, updateProduct, [productData, productWhere]);

				});

			    //Delete data
			    delete data;

		  		console.log('totalProducts %s'.info, totalProducts);

			    queue.add('Exit process', process.exit, [1]);
				done()
			});
		});		
	};

	this.downloadProductPictures = function downloadProductPictures() {

		function callbackPicture(done, job, remoteFile, localFile, picture) {
			
			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				done();
				console.info('downloaded localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
			});

			download.on('error', function error(error) {
				done();
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
			});

			download.downloadPicture(remoteFile, localFile);
		};

		knex('products').where('active', 'N').limit(500).select('id', 'sku', 'numPictures').then(function (results) {
			var numResults = results.length;

			if (numResults === 0) {
				console.info('Nothing to do'.debug);
				queue.add('Exit script', process.exit, [1]);
				queue.run();
				return;
			}


			for (var i=0;i < numResults;++i) {
				for (var picture in webshopSettings.pictures) {
					for (var p=0;p < results[i].numPictures;++p) {

						if (results[i].sku === undefined) {
							console.error('sku doesnt exists'.error, results[i]);
							break;
						}
						var fileName     = results[i].sku+(p > 1 ? '_'+p : '');
						var remoteFile  = 'http://graphics.edc-internet.nl/'+picture+'/'+fileName+'.jpg';
						var localFile = webshopSettings.appDir+'/img/product/'+picture+'/'+fileName+'.jpg';

						var exists = fs.existsSync(localFile);
						if (!exists) {
							queue.add('Downloading '+localFile, callbackPicture, [remoteFile, localFile, picture]);
						}
					}
				}
			}

			queue.add('Check pictures', checkPictures);
			//queue.add('Exit script', process.exit, [1]);
			queue.run();
		});
	};

	var checkPictures = function checkPictures(done, job) {

		knex('products').where('active', 'N').select('id', 'sku', 'numPictures').then(function (results) {
			var numResults = results.length;

			if (numResults === 0) {
				console.info('Nothing to do'.debug);
				queue.add('Exit script', process.exit, [1]);
				queue.run();
				return;
			}

			var totalPicturesFormats = Object.keys(webshopSettings.pictures).length;

			for (var i=0;i < numResults;++i) {

				var totalPictures = results[i].numPictures*totalPicturesFormats;
				var totalFound	  = 0;
				
				for (var picture in webshopSettings.pictures) {
					for (var p=0;p < results[i].numPictures;++p) {

						if (results[i].sku === undefined) {
							console.error('sku doesnt exists'.error, results[i]);
							break;
						}

						var fileName     = results[i].sku+(p > 1 ? '_'+p : '');
						var localFile = webshopSettings.appDir+'/img/product/'+picture+'/'+fileName+'.jpg';
						var exists       = fs.existsSync(localFile);
						if (exists) {
							++totalFound;
						}

					}
				}

				if (totalFound === totalPictures) {
					var updateProductData = {
						id: results[i].id,
						active: 'J'
					};


					queue.add('checkPictures', updateProduct, [updateProductData]);
				}
			}

			queue.add('Exit script', process.exit, [1]);
			done();
		});
	};

	this.apiRequest = function apiRequest(req, res) {
		return require('./api').init(req, res, this);
	};
};

module.exports = (new webshop());