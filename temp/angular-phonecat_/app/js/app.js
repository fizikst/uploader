'use strict';

/* App Module */

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'phonecatAnimations',

  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices',
  'phonecatDirectives',
  'underscore',
  'api',
  'restangular',
  'DataService'
]);

phonecatApp
    .config(['$routeProvider',
      function($routeProvider) {
        $routeProvider.
          when('/', {
            templateUrl: 'partials/main.html',
            controller: 'MainCtrl'/*,
            redirectTo: function (routeParams, path, search) {
                return "/phones/5356b32ccfc39eec709bee05";
            }*/
          }).
          when('/phones/:category?', {
            templateUrl: 'partials/phone-list.html',
            controller: 'PhoneListCtrl'
          }).
          when('/phones/:id', {
            templateUrl: 'partials/phone-detail.html',
            controller: 'PhoneDetailCtrl'
          }).
          when('/cart', {
            templateUrl: 'partials/shopping-cart.html',
            controller: 'ShoppingCartCtrl'
          }).
          when('/articles/:id', {
              templateUrl: 'partials/article-detail.html',
              controller: 'ArticleDetailCtrl'
          }).
          otherwise({
            redirectTo: '/'
          });
      }
]).config(['RestangularProvider',function (RestangularProvider) {
        var baseUrl = 'http://127.0.0.1:8011/api/v1/';
        RestangularProvider.setBaseUrl(baseUrl);
        RestangularProvider.setRestangularFields({
          id: "_id"
        });
        RestangularProvider.setResponseExtractor(function(response, operation) {
            // This is a get for a list
            if (operation === "getList") {
                // Here we're returning an Array which has one special property metadata with our extra information
                var newResponse = response.data;
                newResponse.meta = response.meta;
                newResponse.filter = response.filter;
                return newResponse;
            }
            return response;
        });
}])


/*.config(['$httpProvider',function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])*/;


//function (RestangularProvider) {
//    var baseUrl = 'http://127.0.0.1:8011/api';
////      RestangularProvider.setBaseUrl(baseUrl);
//}
//
//
//.config(['$httpProvider',function ($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//}]) ;