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
    .controller('ListCtrl', ['$scope', '$resource', '$q', 'ngTableParams', 'Product', function($scope, $resource, $q, ngTableParams, Product) {

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
                Api.query(function (res1) {
                    params.total(res1.total);
                    $defer.resolve($scope.users = res1.rows);
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
        };

        $scope.setEdit= function (pid) {
            var prod = new Product();
            prod.id = pid;
            $('.row_' + pid).find('input:text').each(function (idx, input) {
                prod[$(input).attr('name')] = $(input).val();
            });
            Product.update(prod, prod);
            $scope.editId = -1;
            $scope.tableParams.reload();
        };

        $scope.setDelete= function (pid) {
            var prod = new Product();
            Product.delete({id:pid}, prod);
            $scope.tableParams.reload();
        };

        $scope.remove= function (pid) {
            var prod = new Product();
            Product.delete({id:pid}, prod);
        };


        $scope.vote = 0;
        $scope.expand = function(vote) {
            $scope.vote = vote;
        };

        $scope.setPost = function (formId) {
            var prod = new Product();

            $('.' + formId).find('input:text').each(function (idx, input) {
                prod[$(input).attr('name')] = $(input).val();
            });

            prod.$save();
            $scope.vote = 0;
            $scope.tableParams.reload();
        };



    var inArray = Array.prototype.indexOf ?
        function (val, arr) {
            return arr.indexOf(val)
        } :
        function (val, arr) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === val) return i;
            }
            return -1
        };

        $scope.checkboxes = { 'checked': false, items: {} };


        // watch for check all checkbox
        $scope.$watch('checkboxes.checked', function(value) {
            angular.forEach($scope.users, function(item) {
                if (angular.isDefined(item.id)) {
                    $scope.checkboxes.items[item.id] = value;
                }
            });
        });

        $scope.deleteRows = function () {
            angular.forEach($scope.checkboxes.items, function (item, key) {
                if (item) {
                    $scope.remove(key);
                }
            });
            $scope.tableParams.reload();
        };

        // watch for data checkboxes
        $scope.$watch('checkboxes.items', function(values) {
            if (!$scope.users) {
                return;
            }
            var checked = 0, unchecked = 0,
                total = $scope.users.length;
            angular.forEach($scope.users, function(item) {
                checked   +=  ($scope.checkboxes.items[item.id]) || 0;
                unchecked += (!$scope.checkboxes.items[item.id]) || 0;
            });
            if ((unchecked == 0) || (checked == 0)) {
                $scope.checkboxes.checked = (checked == total);
            }
            // grayed checkbox
            angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
        }, true);
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