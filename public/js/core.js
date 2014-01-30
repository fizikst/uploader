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

//            console.log('SCOPE',$scope);
//            var selectOpts = $scope.selectOpt;
//            $scope.selectOpt = {};

//            $http.post('/api/files', {selectOpts: selectOpts, file:file},{headers: {'Content-Type': 'multipart/form-data'}, transformRequest:  function(data) {
//                    var formData = new FormData();
//                    formData.append("selectOpts", angular.toJson(data.selectOpts));
//                    formData.append("file", data.file);
//                    return formData;
//                }}).success( function(data, status, headers, config) {
//                    $scope.rows = data;
//                });

            var selectOpts = $scope.selectOpt;
            $scope.selectOpt = {};

            $http.post('/api/files', {selectOpts: selectOpts, file:file}, {headers: {'Content-Type': undefined }, transformRequest:function(data) {
                var formData = new FormData();
                formData.append("selectOpts", angular.toJson(data.selectOpts));
                formData.append("file", data.file);
                return formData;
            }}).success(function(data, status, headers, config){
                    $scope.rows = data;
                }).
                error(function(data, status, headers, config){
                    $scope.rows = status;
                });

    //        $http({method: 'POST', url: '/api/files', data: formData, headers: {'Content-Type': undefined }, transformRequest: angular.identity})
    //             .success(function(data, status, headers, config) {
    //                 $scope.rows = data;
    //             });
        }
    }])
    .factory('Product', ['$resource', function($resource) {
        return $resource('/api/products/:id', null,
            {
                'update': { method:'PUT' }
            });
    }])
    .controller('ListCtrl', ['$scope', '$resource', 'ngTableParams', 'Product', function($scope, $resource, ngTableParams, Product) {
//        var Api = $resource('/api/products');

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: {
                title: 'asc',
                price: 'asc'
            }
        }, {
//            total: data.length,           // length of data
//            getData: function($defer, params) {
//                 $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
//            }
            total: 0,
            getData: function($defer, params) {

//                $resource('app/data/EpargneATermeRachetableCELI.json', {}, {
//                    query: {method:'GET', params:{}, isArray:true}});
//
                console.log(params.url());
                var Api = $resource('/api/products', params.url(), { query: {method:'GET'}});
                Api.query(function (data) {
                    console.log('DATA', data);
                    params.total(data.total);
                    $defer.resolve(data.rows);
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

        $scope.editId = -1;

        $scope.setEditId =  function(pid) {
            console.log('EDIT', pid);
            $scope.editId = pid;
        }

        $scope.setEdit= function (pid) {
            var prod = Product.get({id:pid});
            Product.update({id:pid, title: 'testing', price: 123}, prod);
        }

        $scope.setDelete= function (pid) {
            var prod = Product.get({id:pid});
            Product.delete({id:pid}, prod);
            $scope.tableParams.reload();
        }

        $scope.vote = 0;
        $scope.expand = function(vote) {
            $scope.vote = vote;
        }

        $scope.setPost = function (formId) {
            var prod = new Product();

            $('.' + formId).find('input:text').each(function (idx, input) {
                prod[$(input).attr('name')] = $(input).val();
            });

            prod.$save();
            $scope.tableParams.reload();
        };
}]);



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