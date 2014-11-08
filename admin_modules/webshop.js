var webshop = function webshop() {
	var download        = require('./download');
	var queue           = require('./queue');
	var parseCsv        = require('csv-parse');
	var xmlreader       = require('xmlreader');
	var downloaded      = {};
	var fs              = require('fs');
	var knex            = '';
	var maxFileTime     = 86400;
	var webshopSettings = { db: {}, pictures: {}, appDir: ''};

	this.init = function init(settings) {

		mergeSettings(settings);

		knex     = require('knex')(webshopSettings.db);

		/*
		Script has to exit when completed
		setTimeout(function () {
			queue.add('Exit script', process.exit, [ 1 ]);
			queue.run();
		}, 30000);
		 */
	};

	var mergeSettings = function mergeSettings(settings) {
		for(var setting in webshopSettings) {
			if (settings[setting] !== undefined) {
				webshopSettings[setting] = settings[setting];
			}
		}
	};

	var checkProducts = function checkProducts(done, jobName, data) {

		var productWhere = {
			/*
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			sku: data.sku,
			subSku: data.subSku,
			*/
			barcode: data.barcode
		};

		knex('products').where(productWhere).limit(1).select('id')
		.then(function(rows) {

		  if (rows.length === 0) {
			insertProduct(done, 'insert product ', data);
		  } else {
		  	if (data.id === undefined) {
		  		data.id = rows[0].id;
		  	}

			updateProduct(done, 'update product ', data);
		  }
		})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex checkProducts chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});

	};

	var insertProduct = function insertProduct(done, jobName, data) {

	  	//Insert
	  	knex.returning('id').insert(data).into('products').then(function insertedProduct(results) {
	  		done();
	  	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex insert chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var updateProduct = function updateProduct(done, jobName, data, update) {
		var where = {};

		if (update === undefined) {

			if (data.id === undefined || !data.id) {
				throw new Error('No product id');
				return;
			}

			where['id'] = data.id;

			delete data.id;
		} else {
			where = update;
		}

		//Update
		knex('products').where(where).update(data)
	  	.then(function (results) {
	  		done();
	  	}, function errorHandling(err){
              //Do something
              console.log(err, 'err');
     	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex update chain error', e);
		  done();
		});
	};

	//Mark products as removed not remove them
	var removeProduct = function removeProduct(done, jobName, data) {

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

	var checkMainCats = function checkMainCats(done, jobName, data) {

		if (data.mainCatId === undefined || !data.mainCatId) {
			throw new Error('No mainCatId');
			return;
		}

		knex('mainCats').where('mainCatId', data.mainCatId).limit(1).select('id')
		.then(function(rows) {

		  if (rows.length === 0) {
			insertMainCat(done, 'insert mainCat ', data);
		  } else {
		  	done();
		  }
		})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex checkMainCats chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var insertMainCat = function insertMainCat(done, jobName, data) {

		var newMainCat = {
			mainCatId: data.mainCatId,
			mainCatTitle: data.mainCat,
			mainCatDesc: data.mainCat,
			name: data.mainCat,
			desc: data.mainCat,
			created: (new Date())
		};

	  	//Insert
	  	knex.returning('id').insert(newMainCat).into('mainCats').then(function insertedMainCat(results) {
	  		done();
	  	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function error(e) {
		  console.error('knex insertMainCat chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var checkSubCats = function checkSubCats(done, jobName, data) {
		
		if (data.subCatId === undefined || !data.subCatId) {
			throw new Error('No subCatId');
			return;
		}

		knex('subCats').where('subCatid', data.subCatId).limit(1).select('id')
		.then(function(rows) {		  
		  if (rows.length === 0) {
			insertSubCat(done, 'insert subCat ', data);
		  } else {
		  	done();
		  }
		})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex checkSubCats chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var insertSubCat = function insertSubCat(done, jobName, data) {

		var newSubCat = {
			mainCatId: data.mainCatId,
			subCatId: data.subCatId,
			subCatTitle: data.subCat,
			subCatDesc: data.subCat,
			name: data.subCat,
			desc: data.subCat,
			created: (new Date())
		};

	  	//Insert
	  	knex.returning('id').insert(newSubCat).into('subCats').then(function insertedSubCat(results) {
	  		done();
	  	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex insertSubCat chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var checkBrands = function checkBrands(done, jobName, data) {

		if (data.brand === undefined || !data.brand) {
			throw new Error('No brand');
			return;
		}

		knex('brands').where('brand', data.brand).limit(1).select('id')
		.debug(function () {
	  		console.log(arguments, 'debug arguments'.debug);

	  	})
		.then(function(rows) {

		  if (rows.length === 0) {
			insertBrand(done, 'insert brand ', data);
		  } else {
		  	done();
		  }
		})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex checkBrands chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};

	var insertBrand = function insertBrand(done, jobName, data) {

		var newBrand = {
			brand: data.brand,
			title: data.brand,
			desc: data.brand,
			created: (new Date())
		};

	  	//Insert
	  	knex.returning('id').insert(newBrand).into('brands')
	  	.then(function insertedBrand(results) {
	  		done();
	  	})
	  	// Finally, add a .catch handler for the promise chain
		.catch(function(e) {
		  console.error('knex insertBrand chain error', e);
		  console.info(data, 'data');
		  done();
		  process.exit(1);
		});
	};
	

	//Create tables
	this.createTables = function () {
		var created      = 0;
		var totalCreated = 6;

		knex.schema.hasTable('brands').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('brands', function(t) {
		      t.increments('id').primary();
		      t.enum('active', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.string('brand', 32);
		      t.string('title', 32);
		      t.text('desc', 'mediumtext');
		      t.dateTime('created', 100);

		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {

			console.log('brands exists: '.debug, exists);
			
			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}
		});

		knex.schema.hasTable('mainCats').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('mainCats', function(t) {
		      t.increments('id').primary();
		      t.enum('active', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.enum('InMenu', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.integer('sort', 2).unsigned();
		      t.integer('mainCatId', 2).unsigned().unique();
		      t.string('mainCatDesc', 100);
		      t.text('mainCatTitle', 'mediumtext');
		      t.string('name', 100);
		      t.text('desc', 'mediumtext');
		      t.integer('itemsARow', 2).unsigned();
		      t.dateTime('created', 100);

		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {

			console.log('mainCats exists: '.debug, exists);
			
			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}
		});

		knex.schema.hasTable('subCats').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('subCats', function(t) {
		      t.increments('id').primary();
		      t.enum('active', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.enum('InMenu', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.integer('sort', 2).unsigned();
		      t.integer('mainCatId', 2).unsigned().index();
		      t.integer('subCatId', 2).unsigned().unique();
		      t.string('subCatTitle', 60);
		      t.text('subCatDesc', 'mediumtext');
		      t.string('name', 100);
		      t.text('desc', 'mediumtext');
		      t.dateTime('created', 100);

			  //set foreign keys
		      t.foreign('mainCatId')
		        .references('mainCatId')
		        .inTable('mainCats')
		        .onDelete('CASCADE');

	          //Table details
		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {

			console.log('subCats exists: '.debug, exists);
			
			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}
		});

		knex.schema.hasTable('customers').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('customers', function(t) {
		      t.increments('id').primary();
		      t.string('email', 256);
		      t.string('firstName', 100);
		      t.string('lastName', 100);
		      t.string('houseNr', 5);
		      t.string('houseNrExt', 5);
		      t.string('zipCode', 8);
		      t.string('city', 32);
		      t.string('country', 32);
		      t.dateTime('created', 100);

	          //Set table details
		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {

			console.log('customers exists: '.debug, exists);
			
			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}
		});

		knex.schema.hasTable('shoppingCart').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('shoppingCart', function(t) {
		      t.increments('id').primary();
		      t.integer('cid').unsigned();
		      t.integer('pid').unsigned();
		      t.string('transActionId', 32);
		      t.integer('amount', 5).unsigned();
		      t.string('ip', 5);
		      t.string('host', 8);
		      t.dateTime('created');

			//set foreign keys
	        t.foreign('cid')
	          .references('id')
	          .inTable('customers')
	          .onDelete('CASCADE');

	        t.foreign('pid')
	          .references('id')
	          .inTable('products')
	          .onDelete('CASCADE');

	          //Set table details
		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {
			console.log('shoppingCart exists: '.debug, exists);
			
			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}
		});

		knex.schema.hasTable('products').then(function(exists) {
		  if (!exists) {
		    return knex.schema.createTable('products', function(t) {
		      t.increments('id').primary();
		      t.enum('active', [ 'J', 'N' ]).nullable().defaultTo('N').index();
		      t.string('sku', 32).index();
		      t.string('subSku', 32).index();
		      t.string('title', 90);
		      t.text('description', 'mediumtext');
		      t.string('brand', 32);
		      t.decimal('buyPrice', 4, 4);
		      t.string('discountPrice', 4, 4);
		      t.string('sellPrice', 4, 4);
		      t.integer('mainCatId', 32).unsigned();
		      t.string('mainCat', 20);
		      t.integer('subCatId', 6).unsigned();
		      t.string('subCat', 32);
		      t.enum('stock', [ 'J', 'N' ]).nullable();
		      t.integer('weekNr', 2).unsigned();
		      t.integer('vat', 2).unsigned();
		      t.string('size', 15);
		      t.string('weight', 32);
		      t.enum('freeOfPlasticizers', [ 'ja','nee','onbekend' ]).nullable();
		      t.enum('battery', [ 'exclusief','inclusief','n.v.t.' ]).nullable();
		      t.string('batteryType', 35);
		      t.string('colour', 20);
		      t.enum('waterproof', [ 'ja','nee','onbekend' ]).nullable();
		      t.string('material', 40);
		      t.integer('length', 8).unsigned();
		      t.integer('diameter', 6).unsigned();
		      t.string('control', 35);
		      t.string('vibration', 40);
		      t.string('power', 30);
		      t.enum('washingTemperature', ['30','40','handwas','n.v.t.']).nullable();
		      t.enum('bleaching', [ 'Ja','Nee','n.v.t.' ]).nullable();
		      t.enum('ironing', [ 'Ja','n.v.t.','Nee' ]).nullable();
		      t.enum('chemicalCleaning', [ 'Ja','n.v.t.','Nee' ]).nullable();
		      t.enum('clothesDryer', [ 'Ja','n.v.t.','Nee' ]).nullable();
		      t.string('fit', 20);
		      t.enum('discount', [ 'J', 'N' ]).nullable();
		      t.enum('remaining', [ 'J', 'N' ]).nullable();
		      t.integer('ean', 20).unsigned();
		      t.string('mainPicture', 32);
		      t.integer('numPictures', 1).unsigned();
		      t.string('barcode', 20);
		      t.enum('video', [ 'FLV','N','SWF' ]).nullable();
		      t.string('lxbxh', 20);
		      t.string('censorpic', 32);
		      t.dateTime('deletedDate');
		      t.dateTime('changed');
		      t.dateTime('created');
			
			  //set foreign keys
	          t.foreign('mainCatId')
	            .references('mainCatId')
	            .inTable('mainCats')
	            .onDelete('CASCADE');

	          t.foreign('subCatId')
	            .references('subCatId')
	            .inTable('subCats')
	          .onDelete('CASCADE');

	          //Set table details
		      t.engine('innodb');
		      t.charset('utf8');
		      t.collate('utf8_general_ci');
		    });
		  } else {
		  	return true;
		  }
		}).then (function (exists) {
			console.log('products exists: '.debug, exists);

			if (exists) {
				++created;
			}

			if (created === totalCreated) {
				process.exit(1);
			}

		});
	};

	this.getAllProducts = function getAllProducts() {

		var remoteFile      = 'http://graphics.edc-internet.nl/b2b_feed.php?key=155223092395BK6Z952BRR52H13H0213&sort=xml&type=xml&lang=nl';
		var localFileName = 'all.xml';
		var localFile     = webshopSettings.appDir+'/tmp/'+localFileName;
				
		function callbackXml(done, job, remoteFile, localFile, picture) {

			download.clearTriggers();
			download.on('downloaded', function downloaded(details) {
				console.info('downloaded: localFile: %s - remoteFile: %s - totalSize: %s'.info, details.localFile, details.remoteFile, details.totalSize);
				queue.add('Parse '+localFile, parseAllProducts, [localFile]);
				done();
				queue.run();
			});

			download.on('error', function error(error) {
				console.error('Error: statusCode %s - response %s'.error, error.statusCode , error.response);
				done();
			});

			download.downloadPicture(remoteFile, localFile);
		};

		fs.exists(localFile, function exists(exists) {
			console.log(localFile+' exists %s'.debug, exists);

			if (!exists) {
				queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
				queue.add('Parse '+localFile, parseAllProducts, [localFile]);
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

					queue.add('Downloading '+localFile, callbackXml, [remoteFile, localFile]);
					queue.add('Parse '+localFile, parseAllProducts, [localFile]);
				} else {
					queue.add('Parse '+localFile, parseAllProducts, [localFile]);
				}

				queue.run();
			});
		});
	};

	var parseAllProducts = function parseAllProducts(done, jobName, localFile) {

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

						queue.add('check mainChats '+i, checkMainCats, [productData]);
						queue.add('check subCats '+i, checkSubCats, [productData]);
						queue.add('check brands '+i, checkBrands, [productData]);

						queue.add('insert product '+i, checkProducts, [productData]);

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

	var parseNewProducts = function parseNewProducts(done, jobName, localFile) {

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

					queue.add('check mainChats '+i, checkMainCats, [productData]);
					queue.add('check subCats '+i, checkSubCats, [productData]);
					queue.add('check brands '+i, checkBrands, [productData]);

					queue.add('insert product '+i, checkProducts, [productData]);

				});

			    //Delete data
			    delete data;

		  		console.log('totalProducts %s'.info, totalProducts);

			    queue.add('Exit process', process.exit, [1]);
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