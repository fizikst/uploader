angular.module('myApp', ['ngRoute', 'ngTable', 'ngResource'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/import', {templateUrl: 'partials/import.html',   controller: 'MainCtrl'}).
            when('/products', {templateUrl: 'partials/products.html', controller: 'ListCtrl'}).
            otherwise({redirectTo: '/products'});
    }])
//    .factory("Product", function ($resource) {
//        return $resource(
//            "/api/products",
//            {},
//            {
//                "reviews": {'method': 'GET', 'params': {}, isArray: true}
//            }
//        );
//    })
    .directive('fileUploader', function() {
        return {
            restrict: 'E',
            templateUrl: 'template/tpl.html',
            link: function($scope, elem, attrs) {
                var fileInput = elem.find('input[type="file"]');
                fileInput.bind('change', function(e) {
                    console.log(e.target.files[0]);
                    $scope.file = e.target.files[0];
                });
            },
            controller: function($scope, $fileUpload) {
                $scope.selectOpt = {};
                $scope.upload = function() {
                    $fileUpload.upload($scope, $scope.file);
                };

                $scope.changeSelect = function(myOpt, ind) {
                    $scope.selectOpt[ind] = myOpt;
                    console.log(ind, myOpt);
                };
            }
        };
    })
/*
    .controller('MainCtrl', ['$fileUpload', function($http) {
        this.upload = function($scope, file) {
//            var Upload = $resource('/api/files',{});
        }
    }])
*/
    .service('$fileUpload', ['$http', '$resource', function($http, $resource) {
        this.upload = function($scope, file) {

            console.log('SCOPE',$scope);
            var selectOpts = $scope.selectOpt;
//            $scope.selectOpt = {};

//            $http.post('/api/files', {selectOpts: selectOpts, file:file},{headers: {'Content-Type': 'multipart/form-data'}, transformRequest:  function(data) {
//                    var formData = new FormData();
//                    formData.append("selectOpts", angular.toJson(data.selectOpts));
//                    formData.append("file", data.file);
//                    return formData;
//                }}).success( function(data, status, headers, config) {
//                    $scope.rows = data;
//                });

            $http({
                method: 'POST',
                url: '/api/files',
                headers: {'Content-Type': false},
                data: {'selectOpts': selectOpts, 'file': file},
                transformRequest: function(data) {
                    var formData = new FormData();
                    formData.append("selectOpts", angular.toJson(selectOpts));
                    formData.append("file", data.file);
                    return formData;
                }
            }).
                success(function(data, status, headers, config){
                    $scope.rows = data;
                }).
                error(function(data, status, headers, config){
                    $scope.rows = status;
                });



//
//            $http.post('/api/files', {selectOpts: selectOpts, file: file}, {headers: {'Content-Type': false }, transformRequest:function(data) {
//                var formData = new FormData();
//                formData.append("selectOpts", angular.toJson(data.selectOpts));
//                formData.append("file", data.file);
//                return formData;
//            }}).success(function(data, status, headers, config){
//                $scope.rows = data;
//            });


    //        $http({method: 'POST', url: '/api/files', data: formData, headers: {'Content-Type': undefined }, transformRequest: angular.identity})
    //             .success(function(data, status, headers, config) {
    //                 $scope.rows = data;
    //             });
        }
    }])
    .controller('ListCtrl', function($scope, $timeout, $resource, ngTableParams) {
//        var Api = $resource('/api/products');




        var data = [{name: "Moroni", age: 50},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34}];


        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10/*,          // count per page
             sorting: {
             name: 'asc'     // initial sorting
             }*/
        }, {
//            total: data.length,           // length of data
//            getData: function($defer, params) {
//                 $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
//            }
            total: 0,
            getData: function($defer, params) {


                var Api = $resource('/api/products', params.url());
                Api.query(function (data) {
                    var res = [];
                    data.forEach(function (value, key) {
                        res.push(value);
                    });

                    params.total(data.length);
                    // set new data
                    console.log(res);
                    $defer.resolve(res);

                });

//                var Api = $resource('/api/products',
//                    {}, {
//                        "reviews": {'method': 'GET', 'params': {}, isArray: true}
//                    });
//
//
//                var data = Api.query();
//
//                $defer.resolve(data);
//                console.log(data);



// Get Booking ID 1
//                var product = Booking.get({},{'Id': 1});
//                Api.get(params.url(), function(data) {
//                    console.log(data.result);
//                    $timeout(function() {
//                        // update table params
//                        params.total(data.total);
//                        // set new data
//                        $defer.resolve(data.result);
//                    }, 500);
//                });
            }
        });
    })
;



function MainCtrl($scope) {
    $scope.headersOpt = [
        { name: 'Наименование', code: 'title' },
        { name: 'Цена', code: 'price' },
        { name: 'Количество', code: 'amount' }
    ];
}

//function ListCtrl($scope, $http) {
//    $http.get('/api/products', {}, {headers: {'Content-Type': false }, transformRequest:function(data) {
//        return new FormData();
//    }})
//    .success(function(data, status, headers, config){
//        $scope.products = data;
//    });
//}