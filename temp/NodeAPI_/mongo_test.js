var mongoose    = require('mongoose');
//var mongodb = require('mongodb')
var acl = require('acl');
var sys = require('sys');

//mongodb.connect('mongodb://localhost:27017/acltemp',function(error, db1) {
//    acl = new acl(new acl.mongodbBackend(db1, 'acl'));
//    console.log(acl);
//    acl.allow('guest', 'categories', 'view', function(err) {console.log('asdadadas-----------------------'); console.log('add role', err);});
//    acl.addUserRoles('joed', 'guset', function(err) {console.log('asdadadas-----------------------'); console.log(err);});
//    acl.isAllowed('joed', 'categories', 'view', function(err, res){
//        console.log('asdadadas-----------------------');
//        if(res){
//            console.log("User joed is allowed to view blogs")
//        }
//    });
//});




mongoose.connect('mongodb://localhost/temp');
var db = mongoose.connection;

db.on('error', function (err) {
    console.error('connection error:', err.message);
});
db.once('open', function callback () {
    console.info("Connected to DB!");

    acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_'));
	console.log(acl);
	acl.allow('numder', 'categories', 'view', function(err) {
		console.log('allow err', err);
		acl.addUserRoles('joed', 'guest', function(err) {
			console.log('add role err', err);
			acl.isAllowed('joed', 'categories', 'view', function(err, res){
				console.log(err, res);
			});
		});
	});

//    acl.allow('guest', 'categories', 'view', function(err) {console.log('asdadadas-----------------------'); console.log('add role', err);});
//    acl.addUserRoles('joed', 'guset', function(err) {console.log('asdadadas-----------------------'); console.log(err);});
//    acl.isAllowed('joed', 'categories', 'view', function(err, res){
//       console.log('asdadadas-----------------------', res);
//       if(res){
//          console.log("User joed is allowed to view blogs")
//       }
//   });

});

//acl = new acl(new acl.memoryBackend());
/*acl.allow('guest', 'blogs', 'view', function(err, res) {
	console.log('add access');
	if (!err) {
		console.log('res',res);
	} else {
		console.log('err',err);
	}
//	console.log(err);
});
acl.addUserRoles('joed', 'guest', function(err, res){
	console.log('add role');
        if (!err) {
                console.log('res',res);
        } else {
                console.log('err',err);
		acl.isAllowed('joed', 'blogs', 'view', function(err, res){
		    if(res){
		        console.log("User joed is allowed to view blogs")
		    }
		});
        }
});*/

/*acl.allow([
    {
        roles:['guest','member'], 
        allows:[
            {resources:'blogs', permissions:'get'},
            {resources:['forums','news'], permissions:['get','put','delete']}
        ]
    }
], function (err) {console.log(err)})*/


var Schema = mongoose.Schema;

var Comments = new Schema({
    title     : String
  , body      : String
  , date      : Date
});

var BlogPost = new Schema({
//    author    : ObjectId
   title     : String
  , body      : String
  , date      : Date
  , comments  : [Comments]
  , meta      : {
        votes : Number
      , favs  : Number
    }
});
var categorySchema = Schema({
    pipi: Number,
    name: String,
    childrens: [{ type: Schema.ObjectId, ref: 'Category' }],
    order: Number
},{ strict: false });

var Category = mongoose.model('Category', categorySchema);

mongoose.model('BlogPost', BlogPost);

// retrieve my model
var BlogPost = mongoose.model('BlogPost');

// create a blog post
var post = new BlogPost();

// create a comment
post.comments.push({ title: 'My comment' });

post.save(function (err) {
  if (!err) console.log('Success!');
});

var cat = new Category();
//cat.childrens.push({'name':'asd'});
//cat.childrens.push({'name':'aasdadsddgfg'});

cat.save(function(err) {
	if (!err) console.log('category success create');
	var cat1 = new Category();
	cat1.childrens.push(cat);
	cat1.set({ 'привет': 3});
	cat1.save(function(){
//		cat1.childrens.push(cat);
	})
})

var Category = mongoose.model('Category', categorySchema);
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

Category.find({ 'привет': 3 }).lean().exec(function (err, person) {
	person.forEach(function(value, key) {
//		var data = JSON.parse(JSON.stringify(value));
		sys.puts(value);

		for(var ind in value) { 
			console.log(value[ind]);			
		}

//		console.log('key:' + key, 'value:' + value);
	});
  if (err) return handleError(err);
 // console.log('is', person) // Space Ghost is a talk show host.
})
