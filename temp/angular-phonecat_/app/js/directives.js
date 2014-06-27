'use strict';

/* Directives */

var phonecatDirectives = angular.module('phonecatDirectives', []);

phonecatDirectives.directive('onBlurChange', function ($parse) {
    return function (scope, element, attr) {
        console.log('onBlur');
        var fn = $parse(attr['onBlurChange']);
        var hasChanged = false;
        element.on('change', function (event) {
            hasChanged = true;
        });

        element.on('change', function (event) {
            if (hasChanged) {
                scope.$apply(function () {
                    fn(scope, {$event: event});
                });
                hasChanged = false;
            }
        });
    };
});

phonecatDirectives.directive('shoppingCart', function ($parse, DataService) {


    return function (scope, element, attr) {
        scope.htmlb = "<span class=rouble>Р</span>";
        scope.cart = DataService.cart;
    };
});


phonecatDirectives.directive('bindHtmlUnsafe', function( $parse, $compile ) {
    return function( $scope, $element, $attrs ) {
        var compile = function( newHTML ) {
            newHTML = $compile(newHTML)($scope);
            $element.html('').append(newHTML);
        };

        var htmlName = $attrs.bindHtmlUnsafe;

        $scope.$watch(htmlName, function( newHTML ) {
            if(!newHTML) return;
            compile(newHTML);
        });

    };
});

phonecatDirectives.directive('menuList', ['$routeParams', 'Api', function ($routeParams, Api) {


    return function (scope, element, attr) {

        Api.articles.search({type:'menu'}).then(function (data) {
            console.log('GET_MENU', data);
            scope.menu = data;
        }, function () {
            console.log('GET_MENU EMPTY');
        });

//        scope.htmlb = "<span class=rouble>Р</span>";
//        scope.cart = DataService.cart;
    };
}]);