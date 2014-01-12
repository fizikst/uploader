var myApp = angular.module('myApp',[]);

//myApp.directive('myDirective', function() {});
//myApp.factory('myService', function() {});

function MyCtrl($scope) {
    $scope.name = 'Superhero';

    $scope.headersOpt = [
        { name: 'Feature', code: 'feature' },
        { name: 'Bug', code: 'bug' },
        { name: 'Enhancement', code: 'enhancement' }
    ];

}
//ng-options="header.code as header.name for header in headersOpt"
myApp.directive('fileUploader', function() {
    return {
        restrict: 'E',
        transclude: false,
        template: '<div><input type="file" multiple /></div>'
            +'<ul><li ng-repeat="file in files">{{file.name}} - {{file.type}}</li></ul>'
//            +'<select ng-model="myOpt" ng-change="changeSelect();" ng-options="header.code as header.name for header in headersOpt"></select>'
//            +'<select ng-model="myOpt_1" ng-change="changeSelect();" ng-options="header.code as header.name for header in headersOpt"></select>'
            +'<table border="1">'
                +'<tr ng-repeat="row in [1]">'
                    +'<td ng-repeat="cell in [1]">'
                        +'<select ng-model="myOpt" ng-change="changeSelect();" ng-options="header.code as header.name for header in headersOpt"></select>'
//                        +'<select ng-model="myOpt" ng-show="$parent.$first === true" ng-change="changeSelect();" ng-options="header.code as header.name for header in headersOpt">'
//                            +'<option>--</option>'
//                            +'<option ng-repeat="header in headersOpt" value="{{header.code}}">{{header.name}}</option>'
//                        +'</select>'
                        +'{{cell.value}}'
                    +'</td>'
                +'</tr>'
            +'</table>'
            +'<button ng-click="upload()">Upload</button>',
        controller: function($scope, $fileUpload) {
//            $scope.changeSelect = function() {
//                console.log($scope.data);
//            };

//            $scope.notReady = true;
            $scope.upload = function() {
                $fileUpload.upload($scope, $scope.files);
            };
        },
        link: function($scope, $element) {
            var fileInput = $element.find('input[type="file"]');
            fileInput.bind('change', function(e) {
                $scope.notReady = e.target.files.length == 0;
                $scope.files = [];
                for(i in e.target.files) {
                    //Only push if the type is object for some stupid-ass reason browsers like to include functions and other junk
                    if(typeof e.target.files[i] == 'object') $scope.files.push(e.target.files[i]);
                }
            });

//            http://jsfiddle.net/pkozlowski_opensource/qEmYG/5/   factory
//            http://jsfiddle.net/winduptoy/QhA3q/ file upload
//            http://plnkr.co/edit/bQNiqNyeuApr7TiCZdct?p=preview
//            http://stackoverflow.com/questions/17756495/how-can-i-access-an-elements-value-using-an-angular-js-directive
//            http://jsfiddle.net/3jLRJ/2/
//            http://onehungrymind.com/angularjs-dynamic-templates/
//            http://blog.brunoscopelliti.com/a-directive-to-manage-file-upload-in-an-angularjs-application
//            http://jsfiddle.net/vishalvasani/4hqVu/   progress bar

//            $scope.$on('domain_done', function( domainElement ) {
//                domainElement.find('.someElementInsideARepeatedElement').click(...);
//            } );


            var ulElem = $element.find('tbody');
            var unreg = $scope.$watch(function() {
                console.log(ulElem.children.length + '=' + $scope.headersOpt.length);
                return ulElem.children.length === $scope.headersOpt.length;
            }, function() {
                console.log(ulElem);
                console.log('ul rendered, children.length = ' + ulElem.children.length);
//                console.log(elem.find('li')[0].className);
                unreg();
            });


/*
            var children = $element.find('table').children();
            for(var i=0;i<children.length;i++){
                var tbody = angular.element(children[i]);

                console.log(tbody);
//                if(children[i].nodeType !== 8){
//                    angular.element(children[i]).css('background', 'grey');
//                }
            }
*/

//            console.log(children);
//            console.log(selectValue);
//            selectValue.bind('change', function(e) {
//                console.log($scope.myOpt_1);
//                console.log($scope.myOpt_2);
//            });

        }
    }
});

myApp.service('$fileUpload', ['$http', function($http) {
    this.upload = function($scope, files) {
//        console.log($scope.selectList);
        //Not really sure why we have to use FormData().  Oh yeah, browsers suck.
        var formData = new FormData();
        for(i in files) {
            formData.append('file_'+i, files[i]);
        }
        $http({method: 'POST', url: '/api/files', data: formData, headers: {'Content-Type': undefined}, transformRequest: angular.identity})
            .success(function(data, status, headers, config) {
                $scope.rows = data.rows;
//                $scope.headers = data.headers;
            });
    }
}]);

myApp.filter('range', function() {
    return function(input, min, max) {
        min = parseInt(min); //Make string input int
        max = parseInt(max);
        for (var i=min; i<max; i++)
            input.push(i);
        return input;
    };
});

//var scotchTodo = angular.module('scotchTodo', []);
//
//function mainController($scope, $http) {
//	$scope.formData = {};
//
//	// when landing on the page, get all todos and show them
//	$http.get('/api/todos')
//		.success(function(data) {
//			$scope.todos = data;
//		})
//		.error(function(data) {
//			console.log('Error: ' + data);
//		});
//
//	// when submitting the add form, send the text to the node API
//	$scope.createTodo = function() {
//		$http.post('/api/todos', $scope.formData)
//			.success(function(data) {
//				$('input').val('');
//				$scope.todos = data;
//			})
//			.error(function(data) {
//				console.log('Error: ' + data);
//			});
//	};
//
//	// delete a todo after checking it
//	$scope.deleteTodo = function(id) {
//		$http.delete('/api/todos/' + id)
//			.success(function(data) {
//				$scope.todos = data;
//			})
//			.error(function(data) {
//				console.log('Error: ' + data);
//			});
//	};
//
//}
