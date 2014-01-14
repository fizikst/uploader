var myApp = angular.module('myApp',[]);

angular.module('myApp', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/import', {templateUrl: 'partials/import.html',   controller: 'MainCtrl'}).
            when('/products', {templateUrl: 'partials/products.html', controller: 'ListCtrl'}).
            otherwise({redirectTo: '/products'});
    }])
    .directive('fileUploader', function() {
        return {
            restrict: 'E',
            templateUrl: 'template/tpl.html',
            link: function($scope, elem, attrs) {
                var fileInput = elem.find('input[type="file"]');
                fileInput.bind('change', function(e) {
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
    .service('$fileUpload', ['$http', function($http) {
    this.upload = function($scope, file) {

        var selectOpts = $scope.selectOpt;
        $scope.selectOpt = {};

        console.log('selectOpt', selectOpts);
        $http.post('/api/files', {selectOpts: selectOpts, file:file}, {headers: {'Content-Type': false }, transformRequest:function(data) {
            var formData = new FormData();
            formData.append("selectOpts", angular.toJson(data.selectOpts));
            formData.append("file", data.file);
            return formData;
        }}).success(function(data, status, headers, config){
            $scope.rows = data;
        });

//        $http({method: 'POST', url: '/api/files', data: formData, headers: {'Content-Type': undefined }, transformRequest: angular.identity})
//             .success(function(data, status, headers, config) {
//                 $scope.rows = data;
//             });
    }
    }]);


function MainCtrl($scope) {
    $scope.headersOpt = [
        { name: 'Наименование', code: 'title' },
        { name: 'Цена', code: 'price' },
        { name: 'Количество', code: 'amount' }
    ];
}

function ListCtrl($scope, $http) {
    $http.get('/api/products', {}, {headers: {'Content-Type': false }, transformRequest:function(data) {
        return new FormData();
    }})
    .success(function(data, status, headers, config){
        $scope.products = data;
    });
}