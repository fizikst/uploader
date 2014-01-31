var Todo = require('./models/todo');
var SpreadsheetReader = require('pyspreadsheet').SpreadsheetReader;
var _ = require('underscore');
var config = require('../config');
var util = require('util');
console.log('config', config);

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

    function GetStringCountParams (selectOpts) {
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

        console.log('REQ', req);

        if (req.body) {
            var selectOpts = JSON.parse(req.body.selectOpts);
            if (_.isEmpty(selectOpts)) {
                opts.maxRows = 3;
                console.log('is empty row 3');
            }
        }

        for (i in req.files) {
            SpreadsheetReader.read(req.files[i]['path'], opts, function (err, workbook) {
                console.log(req.files[i]['path']);
                if (err) {
                    res.send(err);
                }
                var data = {};
                // Iterate on sheets
                workbook.sheets.forEach(function (sheet) {

                    if (_.isEmpty(opts)) {
                        pg.connect(connString, function(err, client, done) {
                            if (err) {
                                res.json(err);
                            }
                            sheet.rows.forEach(function (row) {
                                var dataRow = [];
                                for (var k = 0; k < row.length; k++) {
                                    if (selectOpts.hasOwnProperty(row[k].column)) {
                                        dataRow.push(row[k].value);
                                    }
                                }
                                if (k != 0 ) {
                                    Insert(client,done,dataRow, selectOpts);
                                }
                            });
                        });

                        res.json(data);
                    }  else {
                        data = sheet.rows;
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
        console.log(req.query);
        pg.connect(connString, function(err, client, done) {
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
                        case 'id':
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
                        res.json(data);
                    }
                );
            });
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
        console.log(req.params.id);
        pg.connect(connString, function(err, client, done) {
            done();
            client.query("select * from goods where id = $1 limit 1",[req.params.id],
                function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('GET SINGLE', result.rows[0]);
                    res.json(result.rows[0]);
                }
            );
        });
    });

    app.put('/api/products/:id', function(req, res) {
        pg.connect(connString, function(err, client, done) {
            console.log(req);
            done();
            client.query("UPDATE goods SET title = $1, price = $2 WHERE id = $3;",[req.query.title, req.query.price, req.params.id],
                function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('GET SINGLE');
                    res.json(result.rows[0]);
                }
            );
        });
    });

	app.delete('/api/products/:id', function(req, res) {
        pg.connect(connString, function(err, client, done) {
            done();
            client.query("DELETE FROM goods WHERE id = $1;",[req.params.id],
                function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('DELETE');
                    res.json(result.rows[0]);
                }
            );
        });
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