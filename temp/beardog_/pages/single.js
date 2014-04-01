var fs = require('fs');
var jade = require('jade');

var path = require('path');
var jadePath = path.join(__dirname , 'jade', 'single.jade' );
var str = require('fs').readFileSync(jadePath, 'utf8') ;
var fn = jade.compile(str, { filename: jadePath, pretty: true });

var baseLocals = {currentPage:'/channels'};

var dataFiles = [ 'd01', 'd02', 'd03' ] ;
var data = {};
dataFiles.forEach(function(df) {
  var fileName = path.join(__dirname , '..', 'data', df+'.txt' );
  var dt = fs.readFileSync(fileName, 'utf8') ;

  var p = dt.split('\n');
  var tt = p[0];
//  console.log(tt);
  p.shift();
  var para = [];
  for(var pi=0; pi< p.length; pi++) {
    var str = p[pi] ;
    if(str!='') {
      para.push(str) ;
    }
  }

  data[df] = {'textTitle':tt, 'parag':para};
});

//---
function create(request, response) {

  var textCode = path.basename(request.url);
  console.log('single page ', textCode);

  var locals = baseLocals ;
  locals['textTitle1'] = data[textCode].textTitle;
  locals['paragraphs'] = data[textCode].parag;
  locals['username'] = request.session.username;

  var page = fn(locals);

  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(page);
  response.end();
}

//---
exports.create = create ;

