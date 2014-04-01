var path = require('path') ;
var url = require('url');

var connect = require('connect') ;
var cookieSessions = require('cookie-sessions');

var app = connect.createServer( cookieSessions({secret:'another secret'}) );
app.use(connect.logger('dev')) ;
app.use(connect.bodyParser()) ;

//--- next two lines enable sessions support
app.use(connect.cookieParser());
app.use(connect.session({ secret: 'your secret here'} ));
//note: next two lines are from connect documentation and they seem to be wrong
//app.use(connect.cookieParser('secret string')) ;
//app.use(connect.session({ key: 'sid', cookie: { secure: true }})) ;

//--- routing

//---
app.use(connect.favicon()) ;
app.use(connect.static( path.join(__dirname, 'static')) ) ; //note, we give static files to everyone without any check

//---
var siteUrls = [
  {pattern:'^/login/?$', restricted: false}
, {pattern:'^/logout/?$', restricted: true}
, {pattern:'^/$', restricted: false}
, {pattern:'^/single/\\w+/?$', restricted: true}
];

function authorizeUrls(urls) {
  function authorize(req, res, next) {
    var requestedUrl = url.parse(req.url).pathname;
    for (var ui in urls) {
      var pattern = urls[ui].pattern;
      var restricted = urls[ui].restricted;
      if (requestedUrl.match(pattern)) {
        if (restricted) {
          if (req.session.authorized) {
            next();
            return;
          }
          else{
            req.session.redirectedFrom = requestedUrl;
            res.writeHead(303, {'Location': '/login'});
            res.end();
            return;
          }
        }
        else {
          next();
          return;
        }
      }
    }

    // we get here only if requested url is wrong
    console.log('common 404 for ', req.url);
    res.end('404: there is no ' + req.url + ' here');
  }
  return authorize;
}

app.use('/', authorizeUrls(siteUrls));

//---
var loginPage = require('./pages/login.js') ;
app.use( '/login', function(req, res){
//  console.log('req for /login: ', req.url);
  if(req.method === 'GET') {
    loginPage.create(req, res) ;
  }
  else if (req.method === 'POST') {
    loginPage.processPost(req, res);
  }
});

//---
var singlePageGen = require('./pages/single.js') ;
app.use( '/single', function(req, res){
  singlePageGen.create(req, res) ;
});

//---
app.use('/logout', function(req, res){
  // clear user information
  delete req.session.authorized;
  delete req.session.username ;

  // redirect to main page
  res.writeHead(303, {'Location': '/'});
  res.end();
});

//--- finally
var mainPageGen = require('./pages/mainPage.js') ;
app.use('/', function(req, res){
  if(req.method === 'GET') {
    mainPageGen.create(req, res) ;
  }
  else if (req.method === 'POST') {
    loginPage.processPost(req, res);
  }
});



app.listen(3000);




