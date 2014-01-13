var Todo = require('./models/todo');
var SpreadsheetReader = require('pyspreadsheet').SpreadsheetReader;

module.exports = function(app) {

    // api ---------------------------------------------------------------------
    // post fileconsole.log(req.files);
    app.post('/api/files', function(req, res) {
        console.log(req);
        for (i in req.files) {


//            console.log(req);
//
            SpreadsheetReader.read(req.files[i]['path'], {maxRows: 5 }, function (err, workbook) {

                if (err) {
                    res.send(err);
                }

                if (res.body) {
                    for (var j in req.body.selectOpts) {
                        console.log(req.body.selectOpts[j]);
                    }
                    console.log(res.body.selectOpts);
                }

                var data = {};
//
//                data.headers = [
//                    {
//                        code: '0',
//                        name: '-'
//                    },
//                    {
//                        code: 'price',
//                        name: 'цена'
//                    }, {
//                        code: 'name',
//                        name: 'наименование'
//                    }, {
//                        code: 'amount',
//                        name: 'количество'
//                    }
//                ];

                // Iterate on sheets
                workbook.sheets.forEach(function (sheet) {
//                    console.log('sheet: ' + sheet.name);
                    // Iterate on rows
//                    console.log(sheet.rows);
//                    sheet.rows.forEach(function (row) {
//                        // Iterate on cells
//                        var dataRow = [];
//                        row.forEach(function (cell) {
//                            dataRow.push(cell.address);
//                            console.log(cell.address + ': ' + cell.value);
//                        });
//                        dataXls.push(dataRow);
//                        console.log(row.length);
//                    });

                    data = sheet.rows;
                    res.json(data);
                });
            });
        }



    });

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/todos', function(req, res) {

		// use mongoose to get all todos in the database
		Todo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(todos); // return all todos in JSON format
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