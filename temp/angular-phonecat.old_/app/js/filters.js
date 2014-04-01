'use strict';

/* Filters */

angular.module('phonecatFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});


//phonecatApp.filter('filter', function () {
//    return function (item, x) {
//        console.log(item);
//        console.log(x);
//        return item;
//    };
//});


// Создаем модуль с фильтрами
//angular.module("phoneList", [])
//
//    .filter("numberRange", function(){
//        return function(items, search){
//            if (!search)
//                return items;
//            search = parseInt(search);
//            var test = function(el, idx, array){
//                return el.year > search;
//            };
//            return items.filter(test);
//        };
//    });
angular.module('Filters', []).
    filter('range', function () {
        return function (input, min, max) {
//            console.log(input);
            min = parseInt(min); //Make string input int
            max = parseInt(max);
            for (var i = min; i < max; i++)
//                input.push(i);
//            console.log(input);
            return input;
        };
    });

/*
angular.module('myFilters', []).filter('truncate', function () {
    return function (text, length, end) {
        return text;
        */
/*if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }*//*


    };
});*/
