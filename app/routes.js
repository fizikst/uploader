var Todo = require('./models/todo');
var SpreadsheetReader = require('pyspreadsheet').SpreadsheetReader;
var _ = require('underscore');
var config = require('../config');
var util = require('util');
var sys = require('sys');

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

                            var dataRow = {}, dataCheckbox = {};
                            sheet.rows.shift();
                            sheet.rows.forEach(function (row) {
                                for (var k = 0; k < row.length; k++) {
                                    if (selectOpts.hasOwnProperty(row[k].column)) {
//                                        para[selectOpts[row[k].column]] = row[k].value;
//                                        product.set(para);
                                        dataRow[selectOpts[row[k].column]] = row[k].value;
                                    }
                                    if (checkboxOpts.hasOwnProperty(row[k].column) && checkboxOpts[row[k].column] === 'YES') {
                                        dataCheckbox[selectOpts[row[k].column]] = row[k].value;
                                    }
                                }


                                console.log('DATA', dataRow);
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
/*        pg.connect(connString, function(err, client, done) {
            if (err) {
                res.json(err);
            }
            var sql = "SELECT * FROM goods";

            if (req.query.filter) {
                var filter = []
                    , pre = '';

                for (var i in req.query.filter) {
                    switch(i){
                        case 'title':
                            pre = "LOWER(" + i + ")";
                            break;
                        case 'price':
                            pre = "CAST(" + i + " AS TEXT)";
                            break;
                        default:
                            break;
                    }
                    filter.push(pre + " LIKE '%" + decodeURIComponent(req.query.filter[i]).toLowerCase() +"%'");
                }
                if (Object.keys(req.query.filter).length > 0) {
                    sql += ' WHERE ' + filter.join(' AND ');
                }
            }

            if (req.query.sorting) {
                var sort = [];
                for (var i in req.query.sorting) {
                    sort.push(i + " " + req.query.sorting[i]);
                }
                if (Object.keys(req.query.sorting).length > 0) {
                    sql += ' ORDER BY ' + sort.join(', ');
                }
            }

            console.log('SQL1', sql);

            client.query(sql, function (err, result1) {
                done();
                if (err) {
                    console.log(err);
                }

                if (req.query.count) {
                    sql += " limit " + req.query.count;
                }
                if (req.query.page) {
                    var offset = (req.query.page - 1) * req.query.count;
                    sql += " offset " + offset;
                }
                console.log('SQL2', sql);
                client.query(sql,
                    function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        var data = {};
                        data.total = result1.rowCount;
                        data.rows = result.rows;
                        console.log(data.rows);
                        res.json(data);
                    }
                );
            });
        });*/
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