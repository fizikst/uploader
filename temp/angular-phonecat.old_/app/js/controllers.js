'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {

    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

phonecatControllers.controller('FilterCtrl', ['$scope', '$routeParams', '$resource',
    function($scope, $routeParams, $resource) {

        var Products = $resource('http://127.0.0.1:8011/api/products', {}, {});
        Products.get({
        }, function (data) {
            $scope.search = {};
            $scope.options = data.options;
            $scope.rows = data.rows;
        });
    }]);
