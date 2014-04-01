'use strict';

/* App Module */

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'ngResource',
  'phonecatAnimations',

  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices',
  'Filters'
]);

phonecatApp
    .config(['$routeProvider',
      function($routeProvider) {
        $routeProvider.
          when('/phones', {
            templateUrl: 'partials/phone-list.html',
            controller: 'PhoneListCtrl'
          }).
          when('/phones/:phoneId', {
            templateUrl: 'partials/phone-detail.html',
            controller: 'PhoneDetailCtrl'
          }).
          when('/filter', {
            templateUrl: 'partials/filter.html',
            controller: 'FilterCtrl'
          }).
          otherwise({
            redirectTo: '/phones'
          });
    }])
    .config(['$httpProvider',function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]) ;
