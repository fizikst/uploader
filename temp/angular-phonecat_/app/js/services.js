//'use strict';

/* Services */

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
      var Products = $resource('http://127.0.0.1:8011/api/products', {}, {});
      var obj = {};
      return Products.get({
      }, function (data) {
          obj.search = {};
          obj.options = data.options;
          obj.rows = data.rows;
      });
  }]);

var api = angular.module('api', []);

api.factory('Api', function (Restangular) {

    return {
        headers: {
            search : function (query){
                return Restangular.all("headers").getList(query);
            }
        },
        products: {
            search: function (query) {
                return Restangular.all('products').getList(query);
            },
            get : function (query) {
                return Restangular.one('products', query.id).get();
            }
        },
        articles: {
            search : function (query) {
                return Restangular.all('articles').getList(query);
            },
            get : function (query) {
                console.log('ARTICLE ID', query);
                return Restangular.one('articles', query.id).get();
            }
        },
        orders: {
            post: function (data) {
//                console.log('DAAAAAAAAAAAAAAAAAAT', Restangular.one('products'));

                return Restangular.one('orders').post('',data);
            }
        }
    };

});

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});


var DataService = angular.module('DataService', []);

DataService.factory("DataService", function () {

    // create store
//    var myStore = new store();

    // create shopping cart
    var myCart = new shoppingCart("AngularStore");


    return {
//        store: myStore,
        cart: myCart
    };
});

/*
phonecatControllers.controller('FilterCtrl', ['$scope', '$routeParams', '$resource',
    function($scope, $routeParams, $resource) {

        var Products = $resource('http://127.0.0.1:8011/api/products', {}, {});
        Products.get({
        }, function (data) {
            console.log(data);
            $scope.search = {};
            $scope.options = data.options;
            $scope.rows = data.rows;
        });
    }]);
*/

function shoppingCart(cartName) {
    this.cartName = cartName;
    this.clearCart = false;
    this.checkoutParameters = {};
    this.items = [];
    this.count = '';
    this.orderproc = false;

    // load items from local storage when initializing
    this.loadItems();

    // save items to local storage when unloading
    var self = this;
    $(window).unload(function () {
        if (self.clearCart) {
            self.clearItems();
        }
        self.saveItems();
        self.clearCart = false;
    });
}

// load items from local storage
shoppingCart.prototype.loadItems = function () {
    var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
        try {
            var items = JSON.parse(items);
            for (var i = 0; i <         items.length; i++) {
                var item = items[i];
                if (item.sku != null && item.name != null && item.price != null && item.quantity != null) {
                    item = new cartItem(item.sku, item.name, item.price, item.quantity);
                    this.items.push(item);
                }
            }
        }
        catch (err) {
            // ignore errors while loading...
        }
    }
    this.getShowTitle();
}

// clear the cart
shoppingCart.prototype.clearItems = function () {
    this.items = [];
    this.saveItems();
}

// save items to local storage
shoppingCart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
        localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
    }
}

// adds an item to the cart
shoppingCart.prototype.addItem = function (sku, name, price, quantity) {

    quantity = this.toNumber(quantity);
    if (quantity != 0) {

        // update quantity for existing item
        var found = false;
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            if (item.sku == sku) {
                found = true;
                item.quantity = this.toNumber(item.quantity + quantity);
                if (item.quantity <= 0) {
                    this.items.splice(i, 1);
                }
            }
        }

        // new item, add now
        if (!found) {
            var item = new cartItem(sku, name, price, quantity);
            this.items.push(item);
        }

        this.getShowTitle();
        // save changes
        this.saveItems();
    }
}

shoppingCart.prototype.getShowTitle = function () {
    var suf = this.getTotalCount();
    if (suf==1) return this.count = 'товар';

    if (suf <= 4 && suf != 1) return this.count = 'товара';

    if (suf > 4) return this.count = 'товаров';
}


shoppingCart.prototype.toNumber = function (value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
}

function cartItem(sku, name, price, quantity) {
    this.sku = sku;
    this.name = name;
    this.price = price * 1;
    this.quantity = quantity * 1;
}

// get the total price for all items currently in the cart
shoppingCart.prototype.getTotalCount = function (sku) {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (sku == null || item.sku == sku) {
            count += this.toNumber(item.quantity);
        }
    }
    return count;
}

// get the total price for all items currently in the cart
shoppingCart.prototype.getTotalPrice = function (sku) {
    var total = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (sku == null || item.sku == sku) {
            total += this.toNumber(item.quantity * item.price);
        }
    }
    return total;
}

shoppingCart.prototype.has_items = function() {
    return this.getTotalPrice() > 0;
};