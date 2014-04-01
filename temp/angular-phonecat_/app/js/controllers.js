'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Api', '_',
  function($scope, Api, _) {

/*
      http://plnkr.co/edit/wZuIbDl6sGQ9VgYpLIP3?p=preview
          http://plnkr.co/edit/kt7jjp16MUOXBqdxeUSZ?p=preview
          http://nadeemkhedr.wordpress.com/2013/09/01/build-angularjs-grid-with-server-side-paging-sorting-filtering/
*/

//      $scope.input = [
//          {name:'fd1', price:10},
//          {name:'fd4', price:11},
//          {name:'fd33', price:12, amount:54},
//          {name:'fd4', price:13},
//          {name:'fd5', price:14},
//          {name:'fd4', price:15, amount: 123},
//          {name:'fd7', price:16}
//      ] ;

      $scope.totalPages = 0;
      $scope.customersCount = 0;
      $scope.checked = [];

      $scope.filterCriteria = {
          pageNumber: 1,
          sortDir: 'asc',
          sortedBy: 'id'
      };



//      Api.headers.search($scope.filterCriteria).then(function (data) {
//          $scope.headers = data;
//          console.log('HEADERS', data);
//      }, function () {
//          $scope.headers = [];
//      });


      $scope.fetchResult = function () {
          return Api.products.search($scope.filterCriteria).then(function (data) {
              console.log('REST_PRODUCTS', data);
              $scope.products = data;
              $scope.filter = data.filter;
              console.log($scope.filter);
              $scope.totalPages = $scope.filterCriteria.pageNumber;
              $scope.customersCount = data.length;
              console.log($scope.totalPages);
          }, function () {
              console.log('REST_PRODUCTS EMPTY');
              $scope.customers = [];
              $scope.totalPages = 0;
              $scope.customersCount = 0;
          });
      }

      console.log($scope.fetchResult());


      $scope.filterResult = function () {
          $scope.checked = $scope.filterCriteria;
          $scope.filterCriteria.pageNumber = 1;
          $scope.fetchResult();
          /*    $scope.fetchResult().then(function () {
           //The request fires correctly but sometimes the ui doesn't update, that's a fix
           $scope.filterCriteria.pageNumber = 1;
           });*/
      };

      $scope.empty = function () {
          $scope.filterCriteria = {
              pageNumber: 1,
              sortDir: 'asc',
              sortedBy: 'id'
          };
          $scope.checked = [];
          $scope.fetchResult();
      }

//      $scope.input = Api.rows;

//      $scope.fetchResult = function () {
//          $scope.data = [];
//          $scope.headers = [];

//          console.log('filterCriteria', $scope.filterCriteria);
//          console.log('headers', $scope.headers);
//          if (!_.isEmpty($scope.filterCriteria)) {
//              console.log('exist search');
//              for (var key in $scope.input) {
//                  if ($scope.input[key].name === $scope.filterCriteria.name) {
//                      $scope.data.push($scope.input[key]);
//                      var header = Object.keys($scope.input[key]);
//                      header.splice(header.indexOf('$$hashKey'),1);
//                      $scope.headers = _.union($scope.headers, header);
//                  }
//              }
//          } else {
//              console.log('not search');
//              $scope.filterCriteria = {};
//              for (var key in $scope.input) {
//                  $scope.data.push($scope.input[key]);
//                  var header = Object.keys($scope.input[key]);
//                  $scope.headers = _.union($scope.headers, header);
//              }
//          }
//
//          console.log('header', $scope.headers);

//      };


//      $scope.products = Phone.query();
//    $scope.orderProp = 'age';
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
