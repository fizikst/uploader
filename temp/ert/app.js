/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });*/

var express = require('express'),
    app = express();

//require('formage').init(app, express, [Cat]);
var admin = require('formage-admin').init(app, express);
