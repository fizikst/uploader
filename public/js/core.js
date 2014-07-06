angular.module('myApp', ['ngRoute', 'ngTable', 'ngResource'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/import', {templateUrl: 'partials/import.html',   controller: 'MainCtrl'}).
            when('/products', {templateUrl: 'partials/products.html', controller: 'ListCtrl'}).
            when('/articles', {templateUrl: 'partials/articles.html', controller: 'ArticleCtrl'}).
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
                $scope.checkboxOpt = {};
                $scope.upload = function() {
                    $fileUpload.upload($scope, $scope.file);
                };

                $scope.changeSelect = function(myOpt, ind) {
                    $scope.selectOpt[ind] = myOpt;
                    console.log(ind, myOpt);
                };

                $scope.changeCheckbox = function(check, ind) {
                    $scope.checkboxOpt[ind] = check;
                    console.log(ind, check);
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
            var checkboxOpts = $scope.checkboxOpt;
            $scope.checkboxOpt = {};


            $http.post('/api/files', {selectOpts: selectOpts, checkboxOpts : checkboxOpts, file:file}, {headers: {'Content-Type': undefined }, transformRequest:function(data) {
                var formData = new FormData();
                formData.append("selectOpts", angular.toJson(data.selectOpts));
                formData.append("checkboxOpts", angular.toJson(data.checkboxOpts));
                formData.append("file", data.file);
                return formData;
            }}).success(function(data, status, headers, config){
                    console.log(data);
                    $scope.headersOpt = data.headers;
                    $scope.rows = data.rows;
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
    .directive('ckEditor', [function () {
        return {
            require: '?ngModel',
            restrict: 'C',
            link: function (scope, elm, attr, model) {
                var isReady = false;
                var data = [];
                var ck = CKEDITOR.replace(elm[0]);

                function setData() {
                    if (!data.length) {
                        return;
                    }

                    var d = data.splice(0, 1);
                    ck.setData(d[0] || '<span></span>', function () {
                        setData();
                        isReady = true;
                    });
                }

                ck.on('instanceReady', function (e) {
                    if (model) {
                        setData();
                    }
                });

                elm.bind('$destroy', function () {
                    ck.destroy(false);
                });

                if (model) {
                    ck.on('change', function () {
                        scope.$apply(function () {
                            var data = ck.getData();
                            if (data == '<span></span>') {
                                data = null;
                            }
                            model.$setViewValue(data);
                        });
                    });

                    model.$render = function (value) {
                        if (model.$viewValue === undefined) {
                            model.$setViewValue(null);
                            model.$viewValue = null;
                        }

                        data.push(model.$viewValue);

                        if (isReady) {
                            isReady = false;
                            setData();
                        }
                    };
                }

            }
        };
    }])
    .directive('bindHtmlUnsafe', function( $parse, $compile ) {
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
    })
    .controller('ListCtrl', ['$scope', '$filter', '$resource', '$q', 'ngTableParams', 'Product', function($scope, $filter, $resource, $q, ngTableParams, Product) {

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: {
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                console.log(params.url());
                var Api = $resource('/api/products', params.url(), { query: {method:'GET'}});
                Api.query(function (res1) {
                    params.total(res1.total);
                    console.log('PARAMS'); console.log(params);
                    console.log(res1.rows);
                    console.log('COLUMNS');
                    console.log($scope.columns);
                    if (!$scope.columns) {
                        $scope.columns = res1.options
                    } else {
                        if ($scope.columns < res1.options || $scope.columns > res1.options) {
                            console.log('not equal');
                            $scope.columns = res1.options
                        }
                    }
                    /*[

                        { title: 'Name', field: 'name', visible: true, filter: { 'name': 'text' } },
                        { title: 'Age', field: 'age', visible: true },
                        { title: 'Id', field: '_id', visible: true }
                    ]*/;
                    $defer.resolve($scope.users = params.sorting() ? $filter('orderBy')(res1.rows, params.orderBy()) : res1.rows);
                });
            }

/*
            getData: function($defer, params) {

                console.log(params.url());
                var Api = $resource('/api/products', params.url(), { query: {method:'GET'}});
                Api.query(function (res1) {
                    params.total(res1.total);
                    $defer.resolve($scope.users = res1.rows);
                });
            }
*/
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
            console.log('PROP'); console.log(prod);
            Product.update(prod, prod);
            $scope.editId = -1;
            $scope.tableParams.reload();
        };

        $scope.setDelete= function (pid) {
            console.log('DELETE');
            console.log(pid);
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
            console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
            console.log(value);
            angular.forEach($scope.users, function(item) {
                console.log(item);
                if (angular.isDefined(item._id)) {
                    $scope.checkboxes.items[item._id] = value;
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
//        $scope.$watch('checkboxes.items', function(values) {
//
//            if (!$scope.users) {
//                return;
//            }
//            var checked = 0, unchecked = 0,
//                total = $scope.users.length;
//            angular.forEach($scope.users, function(item) {
//                checked   +=  ($scope.checkboxes.items[item.id]) || 0;
//                unchecked += (!$scope.checkboxes.items[item.id]) || 0;
//            });
//            if ((unchecked == 0) || (checked == 0)) {
//                $scope.checkboxes.checked = (checked == total);
//            }
//            // grayed checkbox
//            angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
//        }, true);
}])
    .factory('Article', ['$resource', function($resource) {
        return $resource('/api/v1/articles/:id', null,
            {
                'update': { method:'PUT' }
            });
    }])
    .controller('ArticleCtrl', ['$scope', '$filter', '$resource', '$q', 'ngTableParams', 'Article', '$http',  function($scope, $filter, $resource, $q, ngTableParams, Article, $http) {

        $scope.article_create = '';

        $scope.article_type = [
            { key: 'article' , value :  'Полезная информация'},
            { key: 'menu' , value: 'Меню'},
            { key: 'spec_price', value : 'Спец. цена'},
            { key: 'metering', value : 'Замер'},
            { key: 'delivery', value :  'Доставка'},
            { key: 'install', value : 'Установка'},
            { key: 'category', value : 'Категории на главной'}
        ];


        $scope.catalog_list = [];

        var Api = $resource('/api/v1/products', {}, { query: {method:'GET'}});
        Api.query(function (res1) {
            for (var key in res1.filter) {
                if (res1.filter[key].title === 'catalog') {
                    for (var i = 0; i < res1.filter[key].data.length; i++ ) {
                        $scope.catalog_list.push({ key: res1.filter[key].data[i], value: res1.filter[key].data[i]});
                    }
//                    $scope.catalog_list = res1.filter[key].data;
                }
            }
        });

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: {
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                var Api = $resource('/api/v1/articles', params.url(), { query: {method:'GET'}});
                Api.query(function (res1) {
                    console.log('ARTICLE ', res1);
                    params.total(res1.meta.meta.total);
                    $defer.resolve($scope.data = res1.data);
                });
            }

        });

        $scope.editArticle = function(pid) {
            var article = new Article();
            article.id = pid;

            var rowId = '#row_' + pid;

            $(rowId).find(':text, select').each(function (idx, input) {
                article[$(input).attr('name')] = $(input).val();
            });

            var file;
            $(rowId).find(':file').each(function (idx, input) {
                console.log('))))))))))', this.files[0]);
                file = this.files[0];
            });

            console.log('ARTICLE', file);

            $http.put('api/v1/articles/' + pid, {article: article, file: file}, {headers: {'Content-Type': undefined }, transformRequest:function(data) {
                var formData = new FormData();
                formData.append("article", angular.toJson(data.article));
                formData.append("file", data.file);
                return formData;
            }}).success(function(data, status, headers, config){
                    console.log('DDDDDDDDDDDDDDDDDD', data);
//                    $scope.headersOpt = data.headers;
//                    $scope.rows = data.rows;
                }).
                error(function(data, status, headers, config){
                    console.log('SSSSSSSSSSSSSSSSSSSS', status);
//                    $scope.rows = status;
                });

/*
            var timeout = setInterval(function() {
                article['desc'] = $(rowId).find('div.article_html').html();
                Article.update(article, article);
                clearInterval(timeout);
            }, 1000);
*/
        };

        $scope.vote = 0;
        $scope.expand = function(vote) {
            $scope.vote = vote;
        };

        $scope.createArticle = function (formId) {
            var article = new Article();
            $('#' + formId).find(':text, select').each(function (idx, input) {
                article[$(input).attr('name')] = $(input).val();
            });

            var file;
            $('#' + formId).find(':file').each(function (idx, input) {
                console.log('))))))))))', this.files[0]);
                file = this.files[0];
            });

            article['desc'] = $('#articleId').html();
            console.log('RRRRRRRRRRR', article);

            $http.post('api/v1/articles', {article: article, file: file}, {headers: {'Content-Type': undefined }, transformRequest:function(data) {
                var formData = new FormData();
                formData.append("article", angular.toJson(data.article));
                formData.append("file", data.file);
                return formData;
            }}).success(function(data, status, headers, config){
                    console.log('DDDDDDDDDDDDDDDDDD', data);
//                    $scope.headersOpt = data.headers;
//                    $scope.rows = data.rows;
                }).
                error(function(data, status, headers, config){
                    console.log('SSSSSSSSSSSSSSSSSSSS', status);
//                    $scope.rows = status;
                });

//            article.$save();
            $scope.vote = 0;
            $scope.tableParams.reload();
        };

        $scope.deleteArticle= function (pid) {
            console.log(pid);
            var article = new Article();
            Article.delete({id:pid}, article);
            $scope.tableParams.reload();
        };

    }]);



function MainCtrl($scope) {
//    $scope.headersOpt = [
//        { name: 'Наименование', code: 'title' }
//    ];
}

//function ListCtrl($scope, $http) {
//    $http.get('/api/products', {}, {headers: {'Content-Type': false }, transformRequest:function(data) {
//        return new FormData();
//    }})
//    .success(function(data, status, headers, config){
//        $scope.products = data;
//    });
//}