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
        var valueList = []
            , count = Object.keys(selectOpts).length
            , i;
        for (i=1; i <= count; i++) {
            valueList.push('$'+i);
        }
        return valueList.join(', ');
    }

    function GetTitleSelectOpts(selectOpts) {
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

        if (req.body) {
            var selectOpts = JSON.parse(req.body.selectOpts);
            if (_.isEmpty(selectOpts)) {
                opts.maxRows = 3;
                console.log('is empty row 3');
            }
        }

        for (i in req.files) {
            SpreadsheetReader.read(req.files[i]['path'], opts, function (err, workbook) {
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
        pg.connect(connString, function(err, client, done) {
            if (err) {
                res.json(err);
            }
            client.query("SELECT * FROM goods",
                function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                    }
                    res.json(result.rows);
                }
            );
        });

    });

	// create todo and send back all todos after creation
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});

	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};