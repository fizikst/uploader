var Todo = require('./models/todo');
var SpreadsheetReader = require('pyspreadsheet').SpreadsheetReader;
var _ = require('underscore');
var config = require('../config');
var util = require('util');
var sys = require('sys');
var http = require('http');
async = require("async");
var validator = require('validator');



var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var productSchema = Schema({
    name: String
},{ strict: false });
var Product = mongoose.model('Product', productSchema);

console.log('config', config);
require('mongoose-pagination');

/*  postgres */
var pg = require('pg');
var conn =  config.postgres;
var connString = util.format("pg://%s:%s@%s:%d/%s", conn.user, conn.password, conn.host,conn.port, conn.database);
/*  !postgres */


module.exports = function(app) {

    function ProductRepository() {}
    /**
     * Find a task by id
     * Param: id of the task to find
     * Returns: the task corresponding to the specified id
     */
//    productRepository.prototype.find = function (id) {}
    /**
     * Find the index of a task
     * Param: id of the task to find
     * Returns: the index of the task identified by id
     */
//    productRepository.prototype.findIndex = function (id) {}
    /**
     * Retrieve all tasks
     * Returns: array of tasks
     */
//    productRepository.prototype.findAll = function () {
//        return this.tasks;
//    }
    /**
     * Save a task (create or update)
     * Param: task the task to save
     */
    ProductRepository.prototype.save = function (product) {
        console.log('RESPONSE', product);
    }
    /**
     * Remove a task
     * Param: id the of the task to remove
     */
//    productRepository.prototype.remove = function (id) {}


    function Insert(client, done, data, selectOpts) {
        var strMaskParams = GetStringCountParams(selectOpts);
        var strTitleParams = GetTitleSelectOpts(selectOpts);
        client.query("INSERT INTO goods (" + strTitleParams + ") VALUES (" + strMaskParams + ")",
            data,
            function (err, result) {
                done();
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    function GetStringCountParams(selectOpts) {
        console.log(selectOpts);
        var valueList = []
            , count = Object.keys(selectOpts).length
            , i;
        for (i=1; i <= count; i++) {
            valueList.push('$'+i);
        }
        return valueList.join(', ');
    }

    function GetTitleSelectOpts(selectOpts) {
        console.log(selectOpts);
        var titleList = []
            , i;
        for (i in selectOpts) {
            titleList.push(selectOpts[i]);
        }
        return titleList.join(', ');
    }


//    function SaveFile(loop, cb, dataRow) {
//        http.get(loop.value, function(res) {
//
//            var buffers = [];
//            var length = 0;
//
//            res.on("data", function(chunk) {
//
//                // store each block of data
//                length += chunk.length;
//                buffers.push(chunk);
//
//            });
//
//            res.on("end", function() {
//
//                // combine the binary data into single buffer
//                var image = Buffer.concat(buffers);
//
//                // determine the type of the image
//                // with image/jpeg being the default
//                var type = 'image/jpeg';
//                if (res.headers['content-type'] !== undefined)
//                    type = res.headers['content-type'];
//
//                dataRow[selectOpts[loop.column]] = image;
//                _.extend(dataRow, { type: type })
//                cb(null);
//            });
//        });
//    }

//    console.log('DOWNLOAD', download('http://kupitdveri59.ru/assets/images/dveri/model_7.jpg'));
    // api ---------------------------------------------------------------------
    // post fileconsole.log(req.files);
    app.post('/api/files', function(req, res) {
        var titleList = []
            , opts = {}
            , i;

//        console.log('REQ', req);

        if (req.body) {
            var selectOpts = JSON.parse(req.body.selectOpts);
            var checkboxOpts = JSON.parse(req.body.checkboxOpts);
            console.log('CHECKBOXOPT', checkboxOpts);
            console.log('SELECTOPT', selectOpts);
            if (_.isEmpty(selectOpts)) {
                opts.maxRows = 3;
                console.log('is empty row 3');
            }
        }

        for (i in req.files) {
            console.log('FILES', req.files[i]['path']);
            SpreadsheetReader.read(req.files[i]['path'], opts, function (err, workbook) {
                console.log(req.files[i]['path']);
                if (err) {
                    res.send(err);
                }
                var data = {};
                // Iterate on sheets
                workbook.sheets.forEach(function (sheet) {

                    if (_.isEmpty(opts)) {


                            sheet.rows.shift();
                            sheet.rows.forEach(function (row) {
                                var dataRow = {}, dataCheckbox = {};
//                                console.log('ROWWWWWWWWWWWWWWWWWWW', row);
                                async.concatSeries(row,
                                    function(loop, cb){
                                        if (selectOpts.hasOwnProperty(loop.column)) {
                                            if (_.isString(loop.value)) {
                                                if (loop.value.indexOf('|') > 0) {
                                                    var values = loop.value.split('|');
                                                    if (values.length > 1) {
                                                        async.concatSeries(values,
                                                            function(loop1, cb1){
                                                                var val = {};
                                                                if (validator.isURL(loop1)) {
                                                                    http.get(loop1, function(res) {
                                                                        var buffers = [];
                                                                        var length = 0;

                                                                        res.on("data", function(chunk) {

                                                                            // store each block of data
                                                                            length += chunk.length;
                                                                            buffers.push(chunk);

                                                                        });

                                                                        res.on("end", function() {

                                                                            // combine the binary data into single buffer
                                                                            var image = Buffer.concat(buffers);

                                                                            // determine the type of the image
                                                                            // with image/jpeg being the default
                                                                            var type = 'image/jpeg';
                                                                            if (res.headers['content-type'] !== undefined)
                                                                                type = res.headers['content-type'];

                                                                            val.image = image;
                                                                            _.extend(val, { type: type })
                                                                            cb1(null, val);
                                                                        });
                                                                    });
                                                                } else if (loop1 !== undefined || loop1 !== ''){
                                                                    val = loop1;
                                                                    cb(null, val);
                                                                } else {
                                                                    cb(null);
                                                                }
                                                            },
                                                            function(err1, result1){
                                                                console.log('COOOONNNNNSSSSSSs', result1);
                                                                if (err1) console.log(err1);
                                                                dataRow[selectOpts[loop.column]] = result1;
                                                                cb(null);
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    if (validator.isURL(loop.value)) {
                                                        http.get(loop.value, function(res) {
                                                            var buffers = [];
                                                            var length = 0;

                                                            res.on("data", function(chunk) {

                                                                // store each block of data
                                                                length += chunk.length;
                                                                buffers.push(chunk);

                                                            });

                                                            res.on("end", function() {

                                                                // combine the binary data into single buffer
                                                                var image = Buffer.concat(buffers);

                                                                // determine the type of the image
                                                                // with image/jpeg being the default
                                                                var type = 'image/jpeg';
                                                                if (res.headers['content-type'] !== undefined)
                                                                    type = res.headers['content-type'];

                                                                dataRow[selectOpts[loop.column]] = [{image:image, type: type}];
                                                                cb(null);
                                                            });
                                                        });
                                                    } else {
                                                        dataRow[selectOpts[loop.column]] = loop.value;
                                                        cb(null);
                                                    }
                                                }
                                            } else {
                                                if (checkboxOpts.hasOwnProperty(loop.column) && checkboxOpts[loop.column] === 'YES') {
                                                    dataCheckbox[selectOpts[loop.column]] = loop.value;
                                                }

                                                dataRow[selectOpts[loop.column]] = loop.value;
                                                cb(null);
                                            }

                                        } else {
                                            cb(null);
                                        }
                                    },
                                    function(err, result){

                                        console.log('RRREERERERER', result);

                                        if (err) console.log(err);
                                        if (_.isEmpty(dataCheckbox)) {
                                            console.log('CONDISHEN EMPTY', dataCheckbox);
                                            Product.update({ $or: [dataRow] }, dataRow, {upsert: true}, function(err){
                                                if (err) console.log(err);
                                            });
                                        } else {
                                            console.log('CONDISHEN NO EMPTY', dataCheckbox);
                                            Product.update({ $and: [dataCheckbox] }, dataRow, {upsert: true}, function(err){
                                                if (err) console.log(err);
                                            });
                                        }
                                    }
                                );


//                                for (var k = 0; k < row.length; k++) {
//                                    var file;
//
//                                    if (validator.isURL(row[k].value)) {
//
//                                        http.get(row[k].value, function(res) {
//
//                                            var buffers = [];
//                                            var length = 0;
//
//                                            res.on("data", function(chunk) {
//
//                                                // store each block of data
//                                                length += chunk.length;
//                                                buffers.push(chunk);
//
//                                            });
//
//                                            res.on("end", function() {
//
//                                                // combine the binary data into single buffer
//                                                var image = Buffer.concat(buffers);
//
//                                                // determine the type of the image
//                                                // with image/jpeg being the default
//                                                var type = 'image/jpeg';
//                                                if (res.headers['content-type'] !== undefined)
//                                                    type = res.headers['content-type'];
//
//                                                _.extend(dataRow, { type: type, image: image })
//                                                console.log('RRRRRRRRRRRRRRR', dataRow);
//
//                                            });
//                                        });
//                                    } else {
//                                        if (selectOpts.hasOwnProperty(row[k].column)) {
//                                            dataRow[selectOpts[row[k].column]] = row[k].value;
//                                        }
//                                        if (checkboxOpts.hasOwnProperty(row[k].column) && checkboxOpts[row[k].column] === 'YES') {
//                                            dataCheckbox[selectOpts[row[k].column]] = row[k].value;
//                                        }
//                                    }
//                                }




//                                Product.update(dataCheckbox, dataRow, {}, function(err){
//                                    if (err) console.log(err);
//                                });
                                                           //{ $or: [dataCheckbox] }
//                                Product.update(dataRow, {}, {upsert: true}, function (err, data, numberAffected) {
//                                    console.log('NUMBERAFFECTED',numberAffected);
//                                    if (err) console.error(err);
//                                });
                            });


//                        pg.connect(connString, function(err, client, done) {
//                            if (err) {
//                                res.json(err);
//                            }
//                            sheet.rows.forEach(function (row) {
//                                var dataRow = [];
//                                for (var k = 0; k < row.length; k++) {
//                                    if (selectOpts.hasOwnProperty(row[k].column)) {
//                                        dataRow.push(row[k].value);
//                                    }
//                                }
//                                if (k != 0 ) {
//                                    Insert(client,done,dataRow, selectOpts);
//                                }
//                            });
//                        });

                        res.json(data);
                    } else {
                        var headers = [];

                        sheet.rows[0].forEach(function (row, index) {
                            var pattern = {};
                            pattern.name = row.value;
                            pattern.code = row.value;
                            headers.push(pattern);
                        });

//                        data.headers = [
//                            { name: 'Наименование', code: 'title' },
//                            { name: 'Цена', code: 'price' }
//                        ];
                        data.headers = headers;
                        data.rows = sheet.rows;
//                        sheet.rows.shift();
//                        data.rows = sheet.rows;
                        console.log(data.rows);
                        res.json(data);
                    }
                    res.json(new Error('error SpreadsheetReader'));
                });
            });
        }



    });

	// api ---------------------------------------------------------------------
	// get all products
	app.get('/api/products', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log("GET PRODUCTS", req.query);
        var sorting = {}, order, skip;
        if (req.query.filter) {
            var filter = {};
            for(var k in req.query.filter) {
                var key = decodeURIComponent(k);
                console.log(decodeURIComponent(k));
                filter[key] = {'$regex': decodeURIComponent(req.query.filter[k]), '$options': 'i'};
            }
            console.log('FILTERS LIST', filter);
        }
        if (filter) {
            var request = filter;
        } else {
            var request = {};
        }

        if (req.query.sorting) {
            for (var i in req.query.sorting) {
                if (req.query.sorting[i] === 'asc') {
                    order = 1;
                } else {
                    order = -1;
                }
                sorting[decodeURIComponent(i)] = order;
            }
        }
        console.log('SORTING', sorting);

        skip = (req.query.page-1) * req.query.count;

        Product.find(request).paginate(req.query.page, req.query.count).lean().exec(function(err, results) {
            console.log('results', results);
            var data = {};
            var options = [];
            var headers = [];
            var type = {};
            var model;

            for (var i = 0; i < results.length; i++) {

                Object.keys(results[i]).forEach(function(key) {
                    var value = results[i][key];
                    if (_.isNumber(value))  {
                        type[key] = 'number';
                    } else if (_.isBoolean(value)) {
                        type[key] = 'boolean';
                    } else {
                        type[key] = 'text';
                    }
                });

                var names = Object.keys(results[i]);
                options = _.union(options, names)
            }

            console.log('OPTIONS', options);
            options.sort();
            for (var i = 0; i < options.length; i++) {
                headers.push({title: options[i], field: options[i], visible: true, type: type[options[i]]});
            }

            console.log('HEADERS', headers);

            Product.count({}, function( err, count){
                data.total = count;
                data.options = headers;
                data.rows = results;
                res.json(data);

            });

        });

//        .sort('mykey', 1).skip(from).limit(to)
    });

    // get single
    app.get('/api/v1/products/:id', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log('GET PRODUCT', req.params['id']);
        var data = {};

        if (req.params['id']) {
            Product.findById(req.params['id'], function (err, product) {
                if (err) {
                    console.log(err);
                }
                data = product;
                res.json(data);
            });
        } else {
            res.json(data);
        }



//        models.visits.update({ _id: req.body.id }, upsertData, { multi: false }, function(err) {
//            if(err) { throw err; }
//            //...
//        }
//        pg.connect(connString, function(err, client, done) {
//            done();
//            client.query("select * from goods where id = $1 limit 1",[req.params.id],
//                function (err, result) {
//                    if (err) {
//                        console.log(err);
//                    }
//                    console.log('GET SINGLE', result.rows[0]);
//                    res.json(result.rows[0]);
//                }
//            );
//        });
    });

    app.get('/api/v1/products', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log("GET PRODUCTS", req.query);
        var sorting = {}, order, skip;
        if (req.query) {
            var filter = {};
            var metaArr = ['pageNumber', 'sortDir', 'sortedBy']
            for(var k in req.query) {
                var key = decodeURIComponent(k);
                if (_.indexOf(metaArr, decodeURIComponent(k)) >= 0) {
                    console.log('--------', _.indexOf(metaArr, decodeURIComponent(k)));
                }  else {
//                        filter[key] = {'$regex': req.query[k], '$options': 'i'};
                    if (key === 'price') {
                        filter[key] = parseFloat(req.query[k]);
                    } else {
                        filter[key] = req.query[k];
                    }
                    console.log('FILTERS LIST', filter);
                }
            }
        }

        if (filter) {
            var request = filter;
        } else {
            var request = {};
        }

        console.log('REQUEST', request);

//        if (req.query.sorting) {
//            for (var i in req.query.sorting) {
//                if (req.query.sorting[i] === 'asc') {
//                    order = 1;
//                } else {
//                    order = -1;
//                }
//                sorting[decodeURIComponent(i)] = order;
//            }
//        }
//        console.log('SORTING', sorting);

//        skip = (req.query.page-1) * req.query.count;

        Product.find(request)/*.paginate(req.query.page, req.query.count)*/.lean().exec(function(err, results) {
            console.log('RESULTS', results);
            var data = {};
            var options = [];
            var headers = [];
            var type = {};
            var model;

            for (var i = 0; i < results.length; i++) {

                Object.keys(results[i]).forEach(function(key) {
                    var value = results[i][key];
                    if (_.isNumber(value))  {
                        type[key] = 'number';
                    } else if (_.isBoolean(value)) {
                        type[key] = 'boolean';
                    } else {
                        type[key] = 'text';
                    }
                });

                var names = Object.keys(results[i]);
                options = _.union(options, names)
            }

//            console.log('OPTIONS', options);
//            options.sort();
//            for (var opt in options) {
//                var key = options[opt];
//                var temp = {
//                    title : key,
//                    field : key,
//                    visible: true,
//                    type: type[key]
//                };
//                console.log('adsad', temp)
//                Product.find().distinct(key, function(error, names) {
//                    temp.data = names;
//                    headers.push(temp);
//                    console.log('HEADERS', headers);
//                });
//            }

            options.sort();
            console.log('OPTIONS',options);
            async.eachSeries(options,
                function(loop, cb){
                    Product.find(request).distinct(loop, function(error, names) {
                        headers.push({title: loop, field: loop, visible: true, type: type[loop], data: names});
                        cb();
                    });
                },
                function(err){
                    if (err) console.log(err);
                    console.log('HEADERS', headers);
                    Product.count({}, function( err, count){
                        data.data = results;
                        data.filter = headers;
                        data.meta = {meta : {"total" : count}};
                        res.json(data);
                    });
                }
            );




//            console.log('OPTIONS', options);
//            options.sort();
//            for (var i = 0; i < options.length; i++) {
//                headers.push({title: options[i], field: options[i], visible: true, type: type[options[i]]});
//            }



        });
    });

	// create goods and send back all goods after creation
	app.post('/api/goods', function(req, res) {

		// create a goods, information comes from AJAX request from Angular

        var product = req.body;
        console.log('PRODUCT', product);

        pr = new ProductRepository();

        pr.save({
            title: product.title || 'Default title',
            price: product.price || 0,
            amount: product.amount || 1
        });
        res.send(200);

	});

	// get single
    app.get('/api/products/:id', function(req, res) {
        console.log(req.params._id);
//        models.visits.update({ _id: req.body.id }, upsertData, { multi: false }, function(err) {
//            if(err) { throw err; }
//            //...
//        }
//        pg.connect(connString, function(err, client, done) {
//            done();
//            client.query("select * from goods where id = $1 limit 1",[req.params.id],
//                function (err, result) {
//                    if (err) {
//                        console.log(err);
//                    }
//                    console.log('GET SINGLE', result.rows[0]);
//                    res.json(result.rows[0]);
//                }
//            );
//        });
    });

    app.put('/api/products/:id', function(req, res) {
        console.log('ID', req.query);
        Product.update({ _id: req.params.id }, req.query, { multi: false }, function(err) {
            if(err) { console.log(err); }
        });
//        pg.connect(connString, function(err, client, done) {
//            console.log(req);
//            done();
//            client.query("UPDATE goods SET title = $1, price = $2 WHERE id = $3;",[req.query.title, req.query.price, req.params.id],
//                function (err, result) {
//                    if (err) {
//                        console.log(err);
//                    }
//                    console.log('GET SINGLE');
//                    res.json(result.rows[0]);
//                }
//            );
//        });
    });

	app.delete('/api/products/:id', function(req, res) {
        console.log(req.params.id);
        Product.remove({ _id: req.params.id }, function(err,result) {
            if (err) {
                console.log(err);
            }
            res.json();
        });
//        pg.connect(connString, function(err, client, done) {
//            done();
//            client.query("DELETE FROM goods WHERE id = $1;",[req.params.id],
//                function (err, result) {
//                    if (err) {
//                        console.log(err);
//                    }
//                    console.log('DELETE');
//                    res.json(result.rows[0]);
//                }
//            );
//        });
	});

    app.post('/api/products', function(req, res) {
        var data = req.body;
        pg.connect(connString, function(err, client, done) {
            done();
            client.query("INSERT INTO goods (title, price, amount) values ($1, $2, $3);",[data.title,data.price,1],
                function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('POST');
                    res.json('200');
                }
            );
        });
    });

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};