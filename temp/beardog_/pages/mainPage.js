var fs = require('fs');
var jade = require('jade');

var path = require('path');
var jadePath = path.join(__dirname , 'jade', 'mainPage.jade' );
var str = require('fs').readFileSync(jadePath, 'utf8') ;
var fn = jade.compile(str, { filename: jadePath, pretty: true });

var baseLocals = {currentPage:'/'};

//---
function create(request, response) {
  var locals = baseLocals ;
  locals.loggedIn = request.session.authorized ? request.session.authorized : false;
  locals.username = request.session.username ? request.session.username : 'no matter what';
//  console.log('at main: ', request.session.authorized, request.session.username);

  var page = fn(locals);

  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(page);
  response.end();
}

//---
exports.create = create ;
