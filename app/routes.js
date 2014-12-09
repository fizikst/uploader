var Todo = require('./models/todo');
var SpreadsheetReader = require('pyspreadsheet').SpreadsheetReader;
var _ = require('underscore');
var config = require('../config');
var util = require('util');
var sys = require('sys');
var http = require('http');
async = require("async");
var validator = require('validator');
var fs = require('fs');
var ROOTDIR = process.cwd();
var PATHFILES = ROOTDIR +"/files/";
var PATHURL = "http://localhost:8082" + "/files/";
var md5 = require('MD5');


var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var productSchema = Schema({
    name: String
},{ strict: false });
var Product = mongoose.model('Product', productSchema);

var orderSchema = Schema({
},{ strict: false });
var Order = mongoose.model('Order', orderSchema);

var articleSchema = Schema({
    title: String,
    desc: String,
    description: String,
    type: String
}, { strict: false });
var Article = mongoose.model('Article', articleSchema);

var colorSchema = Schema({
    title: String
}, { strict: false });
var Color = mongoose.model('Color', colorSchema);

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
                                async.concatSeries(row,
                                    function(loop, cb){
                                        if (selectOpts.hasOwnProperty(loop.column)) {
                                            if (_.isString(loop.value)) {
                                                if (loop.value.indexOf(';') > 0 && selectOpts[loop.column] !== "description") {
                                                    var loops = loop.value.split(';');
                                                    var values = [];
                                                    loops.forEach(function (currentValue) {
                                                        values.push(currentValue.trim());
                                                    });
                                                    console.log('##### ARRAY IMAGES #####', values);
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

                                                                            var arrUrl = loop1.split('/');
                                                                            var nameImage = arrUrl[arrUrl.length-1].split('.');
                                                                            var urlImage = PATHURL + md5(arrUrl[arrUrl.length-1]) + "." + nameImage[nameImage.length -1];
                                                                            var pathImage = PATHFILES + md5(arrUrl[arrUrl.length-1]) + "." + nameImage[nameImage.length -1];

                                                                            fs.writeFile(pathImage, image, {'encoding':'binary', 'flag':'w'}, function(err){
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                                val.image = urlImage;
                                                                                _.extend(val, { type: type })
                                                                                cb1(null, val);
                                                                            });

                                                                        });
                                                                    });
                                                                } else if (loop1 !== undefined || loop1 !== ''){
                                                                    val = loop1;
                                                                    cb1(null, val);
                                                                } else {
                                                                    cb1(null);
                                                                }
                                                            },
                                                            function(err1, result1){
                                                                console.log('##### RESULT GET VALUES ARRAY DATA OF XLS FILE #####', result1);
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

                                                                var arrUrl = loop.value.split('/');
                                                                var nameImage = arrUrl[arrUrl.length-1].split('.');
                                                                var urlImage = PATHURL + md5(arrUrl[arrUrl.length-1]) + "." + nameImage[nameImage.length -1];
                                                                var pathImage = PATHFILES + md5(arrUrl[arrUrl.length-1]) + "." + nameImage[nameImage.length -1];

                                                                fs.writeFile(pathImage, image, {'encoding':'binary', 'flag':'w'}, function(err){
                                                                    if (err) {
                                                                        console.log(err);
                                                                    }
                                                                    dataRow[selectOpts[loop.column]] = [{image:urlImage, type: type}];
                                                                    cb(null);
                                                                });

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
            console.log('results&&&&&&&&&&&&&&&&', results);
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


/*
    app.options('/api/v1/orders', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log('POST ORDER___________________________________________', req.body);
        var data = {};

//        if (req.params['id']) {
//            Product.findById(req.params['id'], function (err, product) {
//                if (err) {
//                    console.log(err);
//                }
//                data = product;
//                res.json(data);
//            });
//        } else {
            res.json(data);
//        }
    });
*/

    app.post('/api/v1/orders', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log('POST ORDER___________________________________________', req.body);


        var order = new Order(req.body);

        order.save(function (err) {
            if (err) {
                console.log('ORDER_ADD', err);
                res.json({err:err});
            }
            res.json({code:200});
        });
    });

    app.options('/api/v1/orders', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        var data = {};
        res.json(data);
    });

//------------------------- Articles ----------------------------------

    app.get('/api/v1/articles', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        var data = {}, request = {};
        if (req.query.page || req.query.count) {
        } else {
            request = req.query;
        }

        Article.find(request).paginate(req.query.page, req.query.count).lean().exec(function(err, results) {
            if (err) {
                res.json({err:err});
            }
            Article.count({}, function(err, count){
                data.data = results;
                data.meta = {meta:{total:count}};
                res.json(data);
            });
        });
    });

    app.post('/api/v1/articles', function(req, res) {


        console.log('---------------->', req.files);

        var image = [];

        if (!_.isEmpty(req.files)) {

            var type = 'image/jpeg';
            if (!_.isUndefined(req.files.file.type)) {
                type = req.files.file.type;
            }


            fs.readFile(req.files.file.path, function(err, data) {
                var base64data = new Buffer(data);
                image.push({'image': base64data, 'type' : type});

                var data = {};
                var jsonArticle = JSON.parse(req.body.article);
                for (var key in jsonArticle) {
                    data[key] = jsonArticle[key];
                }
                if (image.length > 0) {
                    data['url'] = image;
                }

                var article = new Article(data);


                article.save(function (err) {
                    if (err) {
                        console.log('ARTICLE_ADD', err);
                        res.json({err:err});
                    }
                    res.json({code:200});
                });

                return;
            });

        } else {

            var data = {};
            var jsonArticle = JSON.parse(req.body.article);
            for (var key in jsonArticle) {
                data[key] = jsonArticle[key];
            }
            if (image.length > 0) {
                data['url'] = image;
            }

            console.log('************', data);
            var article = new Article(data);


            article.save(function (err) {
                if (err) {
                    console.log('ARTICLE_ADD', err);
                    res.json({err:err});
                }
                res.json({code:200});
            });
        }

    });

    app.put('/api/v1/articles/:id', function(req, res) {

        var image = [];

        if (!_.isEmpty(req.files)) {
            console.log('FFFFFIIIIILE', _.isEmpty(req.files));

            var type = 'image/jpeg';
            if (!_.isUndefined(req.files.file.type)) {
                type = req.files.file.type;
            }


            fs.readFile(req.files.file.path, function(err, data) {
                var base64data = new Buffer(data);
                image.push({'image': base64data, 'type' : type});

                var data = {};
                var jsonArticle = JSON.parse(req.body.article);
                for (var key in jsonArticle) {
                    data[key] = jsonArticle[key];
                }
                if (image.length > 0) {
                    data['url'] = image;
                }

                delete data.id;

                console.log('************', data);

                Article.update({ _id: req.params.id }, data, { multi: false }, function(err) {
                    if(err) {
                        console.log(err);
                    }
                    res.json({code:200});
                });
            });

            return;
        }  else {

            console.log('---------', req.body);
            Article.update({ _id: req.params.id }, JSON.parse(req.body.article), { multi: false }, function(err) {
                if(err) {
                    console.log(err);
                }
                res.json({code:200});
            });

        }

    });

    app.delete('/api/v1/articles/:id', function(req, res) {
        console.log(req.params.id);
        Article.remove({ _id: req.params.id }, function(err,result) {
            if (err) {
                console.log(err);
            }
            res.json();
        });
    });

    app.get('/api/v1/articles/:id', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log('GET ARTICLE', req.params['id']);
        var data = {};

        if (req.params['id']) {
            Article.findById(req.params['id'], function (err, article) {
                if (err) {
                    console.log(err);
                }
                data = article;
                res.json(data);
            });
        } else {
            res.json(data);
        }
    });
//------------------------- End Articles ----------------------------------


//------------------------- Colors ----------------------------------

    app.get('/api/v1/colors', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        var data = {}, request = {};
        if (req.query.page || req.query.count) {
        } else {
            request = req.query;
        }

        Color.find(request).paginate(req.query.page, req.query.count).lean().exec(function(err, results) {
            if (err) {
                res.json({err:err});
            }
            Color.count({}, function(err, count){
                data.data = results;
                data.meta = {meta:{total:count}};
                res.json(data);
            });
        });
    });

    app.post('/api/v1/colors', function(req, res) {

        console.log('----- COLORS REQUEST -----', req.files);

        var image = [];

        if (!_.isEmpty(req.files)) {

            var type = 'image/jpeg';
            if (!_.isUndefined(req.files.file.type)) {
                type = req.files.file.type;
            }


            fs.readFile(req.files.file.path, function(err, data) {
                var base64data = new Buffer(data);
                image.push({'image': base64data, 'type' : type});

                var data = {};
                var jsonColor = JSON.parse(req.body.color);
                for (var key in jsonColor) {
                    data[key] = jsonColor[key];
                }
                if (image.length > 0) {
                    data['url'] = image;
                }

                console.log('***** DATA COLOR BEFORE CREATE NEW if EXIST FILE *****', data);
                var color = new Color(data);


                color.save(function (err) {
                    if (err) {
                        console.log(' ***** COLOR ERROR CREATE *****', err);
                        res.json({err:err});
                    }
                    res.json({code:200});
                });

                return;
            });
        }  else {
            var data = {};
            var jsonColor = JSON.parse(req.body.color);
            for (var key in jsonColor) {
                data[key] = jsonColor[key];
            }
            if (image.length > 0) {
                data['url'] = image;
            }

            console.log('***** DATA COLOR BEFORE CREATE NEW if NOT EXIST FILE *****', data);
            var color = new Color(data);


            color.save(function (err) {
                if (err) {
                    console.log(' ***** COLOR ERROR CREATE *****', err);
                    res.json({err:err});
                }
                res.json({code:200});
            });
        }

    });

    app.put('/api/v1/colors/:id', function(req, res) {

        var image = [];

        if (!_.isEmpty(req.files)) {

            console.log('##### COLOR FILE #####', _.isEmpty(req.files));

            var type = 'image/jpeg';
            if (!_.isUndefined(req.files.file.type)) {
                type = req.files.file.type;
            }


            fs.readFile(req.files.file.path, function(err, data) {
                var base64data = new Buffer(data);
                image.push({'image': base64data, 'type' : type});

                var data = {};
                var jsonColor = JSON.parse(req.body.color);
                for (var key in jsonColor) {
                    data[key] = jsonColor[key];
                }
                if (image.length > 0) {
                    data['url'] = image;
                }

                delete data.id;

                console.log('***** COLOR DATA *****', data);

                Color.update({ _id: req.params.id }, data, { multi: false }, function(err) {
                    if(err) {
                        console.log(err);
                    }
                    res.json({code:200});
                });
            });

            return;

        } else {

            console.log('##### COLOR BODY REQUEST #####', req.body);
            Color.update({ _id: req.params.id }, JSON.parse(req.body.color), { multi: false }, function(err) {
                if(err) {
                    console.log(err);
                }
                res.json({code:200});
            });

        }

    });

    app.delete('/api/v1/colors/:id', function(req, res) {
        console.log(req.params.id);
        Color.remove({ _id: req.params.id }, function(err,result) {
            if (err) {
                console.log(err);
            }
            res.json();
        });
    });

    app.get('/api/v1/colors/:id', function(req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        console.log('##### GET COLOR REQUEST #####', req.params['id']);
        var data = {};

        if (req.params['id']) {
            Color.findById(req.params['id'], function (err, color) {
                if (err) {
                    console.log(err);
                }
                data = color;
                res.json(data);
            });
        } else {
            res.json(data);
        }
    });
//------------------------- End Colors ----------------------------------


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
                console.log("##### GET PRODUCT #####", product);
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

        console.log(" ##### GET REQUEST PRODUCTS ##### ", req.query);
        var sorting = {}, order, skip;
        if (req.query) {
            var filter = {};
            var metaArr = ['pageNumber', 'sortDir', 'sortedBy', 'count'];
            var conditionPrice = {};

            for(var k in req.query) {
                var key = decodeURIComponent(k);
                if (_.indexOf(metaArr, decodeURIComponent(k)) >= 0) {
                    console.log('--------', _.indexOf(metaArr, decodeURIComponent(k)));
                }  else {
                    if (key === 'price_to' || key === 'price_from') {

                        if (! _.isNaN(parseFloat(req.query[key]))) {
                            if (key === 'price_to') {
                                conditionPrice['$gte'] = parseFloat(req.query[k]);
                            } else {
                                conditionPrice['$lte'] =  parseFloat(req.query[k]);
                            }
                        }

                    } else {
                        filter[key] = req.query[k];
                    }
                    if (!_.isEmpty(conditionPrice)) {
                        filter['price'] = conditionPrice;
                    }
                }                                                              1
            }
        }

        var request;
        if (filter) {
            request = filter;
        } else {
            request = {};
        }

        console.log('##### REQUEST MONGODB #####', request);

        Product.find(request).paginate(req.query.pageNumber, req.query.count).sort({order: 1}).lean().exec(function(err, results) {
            console.log('RESULTS', results);
            var data = {};
            var options = [];
            var headers = [];
            var type = {};
            var model;

            if (!_.isUndefined(results)) {
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

                options.sort();
                console.log('OPTIONS',options);
                async.eachSeries(options,
                    function(loop, cb){
                        var filterList = ['title','price','category', 'color', 'size', 'vendor', 'coating', 'available'];
                        if (filterList.indexOf(loop) >= 0) {

                            Product.find(request).distinct(loop, function(error, names) {
                                var values = names.filter(Boolean);
                                headers.push({title: loop, field: loop, visible: true, type: type[loop], data: values});
                                cb();
                            });
                        } else {
                            cb();
                        }

                    },
                    function(err){
                        if (err) console.log(err);
                        console.log('##### HEADER FOR PRODUCT LIST #####', headers);
                        Product.count(request, function( err, count){
                            data.data = results;
                            data.filter = headers;
                            data.meta = {meta : {"total" : count}};
                            res.json(data);
                        });
                    }
                );
            } else {
                res.send(404);
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