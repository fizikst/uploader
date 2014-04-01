var fs = require('fs');
var jade = require('jade');

var path = require('path');
var jadePath = path.join(__dirname , 'jade', 'login.jade' );
var str = require('fs').readFileSync(jadePath, 'utf8') ;
var fn = jade.compile(str, { filename: jadePath, pretty: true });

var baseLocals = {currentPage:'/login'};

//---
function create(request, response) {
  var nw = false;
  if ( typeof(request.session.redirectedFrom) !== 'undefined') {
    nw = true;
  }

  var locals = baseLocals ;
  if (nw) {
    locals.needsWarning = true;
  }
  else {
    locals.needsWarning = false;
  }
  locals.loggedIn = request.session.authorized ? request.session.authorized : false;
  locals.username = request.session.username ? request.session.username : 'no matter what';

  locals.wrongPassword = false;
  if (request.session.enteredWrongPassword) {
    locals.wrongPassword = request.session.enteredWrongPassword ;
    delete request.session.enteredWrongPassword ;
  }

  var page = fn(locals);
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(page);
  response.end();
}

/**
 * Processes POST request with user's name and password.
 * @param request
 * @param response
 */
function processPost(request, response) {
  console.log('processing POST request: ', request.body.login, request.body.password, request.body.remember);

  var nextLocation = '/login' ;

  if ((request.body.login==='Thor')&&(request.body.password==='111')) {
    request.session.authorized = true;
    request.session.username = request.body.login;

    if ( typeof(request.session.redirectedFrom) === 'string') {
      nextLocation = request.session.redirectedFrom ;
      delete request.session.redirectedFrom ;
    }
    else {
      nextLocation = '/' ; //always redirect to main page
    }

    delete request.session.enteredWrongPassword;
    console.log('Thor is here!');
  }
  else {
    request.session.enteredWrongPassword = true;
    nextLocation = '/login';
  }

  response.writeHead(303, {'Location': nextLocation});
  response.end();
}

//---
exports.create = create ;
exports.processPost = processPost ;

