var myApp = angular.module('myApp',[]);
angular.module('myApp', [])
    .directive('fileUploader', function() {
        return {
            restrict: 'E',
            templateUrl: 'tpl.html',
            link: function($scope, elem, attrs) {
                var fileInput = elem.find('input[type="file"]');
                fileInput.bind('change', function(e) {
                    $scope.file = e.target.files[0];
                });
            },
            controller: function($scope, $fileUpload) {
                $scope.selectOpt = [];
                $scope.upload = function() {
                    $fileUpload.upload($scope, $scope.file);
                };

                $scope.changeSelect = function(myOpt, ind) {
                    var obj = {};
                    obj[ind] = myOpt;
                    $scope.selectOpt.push(obj);
                    console.log(myOpt);
                };
            }
        };
    })
    .service('$fileUpload', ['$http', function($http) {
    this.upload = function($scope, file) {
        var formData = new FormData();
        formData.append('file', file);
        formData.append('selectOpts', $scope.selectOpt);
        console.log($scope.selectOpt);
        $scope.selectOpt = [];

//        var rows = [
//            [{'value':'goods1'},{'value':123.00},{'value':'product'},{'value':10}, {'value':'bla'}],
//            [{'value':'goods2'},{'value':321.00},{'value':'product'},{'value':5}, {'value':'bla-bla'}],
//            [{'value':'goodsN'},{'value':999.00},{'value':'product'},{'value':99}, {'value':'bla-..-bla'}]
//        ];

        $http({method: 'POST', url: '/api/files', data: formData, headers: {'Content-Type': undefined}, transformRequest: angular.identity})
             .success(function(data, status, headers, config) {
                 $scope.rows = data;
             });

//        $scope.rows = rows;
    }
}]);


function MainCtrl($scope) {
    $scope.headersOpt = [
        { name: 'name', code: 'nm' },
        { name: 'price', code: 'pr' },
        { name: 'amount', code: 'mn' }
    ];
}
