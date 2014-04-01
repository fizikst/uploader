//'use strict';

/* Services */

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
/*
    return $resource('http://127.0.0.1:8011/api/products', {}, {
        query: {method:'GET', params:{}, isArray:true}
    });
*/
      var Products = $resource('http://127.0.0.1:8011/api/products', {}, {});
      var obj = {};
      return Products.get({
      }, function (data) {
          obj.search = {};
          obj.options = data.options;
          obj.rows = data.rows;
      });
//    return $resource('phones/:phoneId.json', {}, {
//      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
//    });
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
            }
        }
    };

//    var Products = $resource('http://127.0.0.1:8011/api/products', {}, {});
//    return Products.get({}, function (data) {
//            obj.search = {};
//            obj.options = data.options;
//            var rows = data.rows;
//            console.log(rows);
//            return data
//    });

});

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
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



