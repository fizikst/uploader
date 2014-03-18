var Faker = require('Faker');
var randomName = Faker.Name.findName(); // Rowan Nikolaus
var randomEmail = Faker.Internet.email(); // Kassandra.Haley@erich.biz
var randomCard = Faker.Helpers.createCard();


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/faker');

var Vendor = mongoose.model('Vendor', { firstName:  { type : String, index : true }, lastName:  { type : String, index : true } });

var Product = mongoose.model('Product', { zipCode: { type : String, index : true }, city: { type : String, index : true }, streetName: { type : String, index : true }, streetAddress: { type : String, index : true }, secondaryAddress: String });

var vendor = new Vendor({ firstName: Faker.Name.firstName(), lastName: Faker.Name.lastName() });
//vendor.index({firstName: 1, lastName: 1}, {unique: true});
//vendor.index({ firstName: 1, type: -1 });
//var product = new Product({ zipCode: Faker.Address.zipCode(), city: Faker.Address.city(), streetName: Faker.Address.streetName(), streetAddress: Faker.Address.streetAddress(), secondaryAddress: Faker.Address.secondaryAddress() });

function InsertVendor () {
	vendor.save(function (err) {
		if (err) console.log(err);
	});
}

function InsertProduct () {
	var product = new Product({ zipCode: Faker.Address.zipCode(), city: Faker.Address.city(), streetName: Faker.Address.streetName(), streetAddress: Faker.Address.streetAddress(), secondaryAddress: Faker.Address.secondaryAddress() });
	product.save(function (err) {
                if (err) console.log(err);
        });
}

//InsertVendor();
//InsertProduct();

/*for (var j =0 ; j < 100000; j++) {
	console.log(j);
	InsertProduct();
}*/


console.time("queryTime");
Product.find({ secondaryAddress: 'Apt. 975' }, function (err, docs) {
	console.log(docs);
	console.timeEnd("queryTime");
});

//console.log(randomName, randomEmail);
