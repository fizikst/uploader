'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('MainCtrl', ['$scope', '$routeParams', 'Phone', 'Api', '_', 'DataService', '$http', '$location',
    function($scope, $routeParams, Phone, Api, _, DataService, $http, $location) {


        $scope.totalPages = 0;
        $scope.customersCount = 0;
        $scope.checked = [];

        $scope.pagination = {
            numPages: 1,
            perPage: 25,
            page: 1
        };

        $scope.filterCriteria = {
            pageNumber: $scope.pagination.page,
            sortDir: 'asc',
            sortedBy: 'id',
            count:$scope.pagination.perPage
        };

//      $scope.pagination = Pagination.getNew(10);


        $scope.pagination.nextPage = function() {

            if ($scope.pagination.page < $scope.pagination.numPages) {
                $scope.pagination.page += 1;

                $scope.filterCriteria = {
                    pageNumber: $scope.pagination.page,
                    sortDir: 'asc',
                    sortedBy: 'id',
                    count:$scope.pagination.perPage
                };
                $scope.fetchResult();
            }
        };

        $scope.pagination.prevPage = function() {
            if ($scope.pagination.page > 0) {
                $scope.pagination.page -= 1;

                $scope.filterCriteria = {
                    pageNumber: $scope.pagination.page,
                    sortDir: 'asc',
                    sortedBy: 'id',
                    count:$scope.pagination.perPage
                };
                $scope.fetchResult();
            }
        };

        $scope.pagination.toPageId = function(id) {
            console.log('Id', id);
            if (id >= 0 && id <= $scope.pagination.page) {
                id++;
                $scope.pagination.page = id;

                $scope.filterCriteria = {
                    pageNumber: $scope.pagination.page,
                    sortDir: 'asc',
                    sortedBy: 'id',
                    count:$scope.pagination.perPage
                };
                $scope.fetchResult();
            }
        };

        $scope.helpful = function() {
            Api.articles.search({type:'article'}).then(function (data) {
                console.log('REST_ARTICLE', data);
                $scope.articleOpts = data;
//              console.log('ARt', $scope.articleOpts);
//              console.log($scope.totalPages);
            }, function () {
                console.log('REST_ARTICLE EMPTY');
            });

            Api.articles.search({type:'spec_price'}).then(function (data) {
                $scope.specPrice = data;
            }, function () {
            });

            Api.articles.search({type:'metering'}).then(function (data) {
                $scope.metering = data;
            }, function () {
            });

            Api.articles.search({type:'delivery'}).then(function (data) {
                $scope.delivery = data;
            }, function () {
            });

            Api.articles.search({type:'install'}).then(function (data) {
                $scope.install = data;
            }, function () {
            });

            Api.articles.search({type:'category'}).then(function (data) {
                $scope.categories = data;
            }, function () {
            });


        };

        $scope.helpful();
//
//      Api.headers.search($scope.filterCriteria).then(function (data) {
//          $scope.headers = data;
//          console.log('HEADERS', data);
//      }, function () {
//          $scope.headers = [];
//      });


        $scope.fetchResult = function () {

//          if ($routeParams.hasOwnProperty('_id')) {
//              $scope.filterCriteria._id = $routeParams._id;
//            console.log(':::::::::::::::::::::rout PAram', $routeParams);
//          }

            return Api.products.search($scope.filterCriteria).then(function (data) {
                console.log('REST_PRODUCTS', data);
                $scope.products = data;
                $scope.filter = data.filter;
                console.log($scope.filter);
                $scope.totalPages = $scope.filterCriteria.pageNumber;
                $scope.customersCount = data.length;
                $scope.pagination.numPages = Math.ceil(data.meta.meta.total/$scope.pagination.perPage);
            }, function () {
                console.log('REST_PRODUCTS EMPTY');
                $scope.customers = [];
                $scope.totalPages = 0;
                $scope.customersCount = 0;
            });
        };


        console.log($scope.fetchResult());

        $scope.filterResultMain = function () {
            var filterList = ['title','price','category'];
            $scope.checked = $scope.filterCriteria;

            for (var criteria in $scope.filterCriteria) {
                console.log('OOOOOOOOO',filterList.indexOf(criteria));
                if (filterList.indexOf(criteria) > 0) {
                    var requestParams = '?' + criteria + '=' + $scope.filterCriteria[criteria]
                    var request = '/app/index.html/phones' + requestParams;
                    console.log('&&&&&&&&&&&&&&&&&&' , request);
                    var u = $location.url('/app/index.html').absUrl();
                    console.log(u);
                }
//                $location.path('/app/index.html#/phones');
            }
            //            $location.path('/app/index.html#/phones?');
            //$scope.filterCriteria.pageNumber = 1;
            //$scope.fetchResult();
        };

        $scope.empty = function () {
            $scope.filterCriteria = {
                pageNumber: 1,
                sortDir: 'asc',
                sortedBy: 'id',
                count:$scope.pagination.perPage
            };
            $scope.checked = [];
            $scope.fetchResult();
        }

    }]);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Api', '_', '$routeParams', '$http',
  function($scope, Api, _, $routeParams,$http) {

/*
      http://plnkr.co/edit/wZuIbDl6sGQ9VgYpLIP3?p=preview
          http://plnkr.co/edit/kt7jjp16MUOXBqdxeUSZ?p=preview
          http://nadeemkhedr.wordpress.com/2013/09/01/build-angularjs-grid-with-server-side-paging-sorting-filtering/

*/

//      $scope.input = [
//          {name:'fd1', price:10},
//          {name:'fd4', price:11},
//          {name:'fd33', price:12, amount:54},
//          {name:'fd4', price:13},
//          {name:'fd5', price:14},
//          {name:'fd4', price:15, amount: 123},
//          {name:'fd7', price:16}
//      ] ;

//      console.log('DataService', DataService);

      $scope.requestParams = false;
      $scope.totalPages = 0;
      $scope.customersCount = 0;
      $scope.checked = [];

      $scope.pagination = {
          numPages: 1,
          perPage: 25,
          page: 1
      };


      $scope.filterCriteria = {
          pageNumber: $scope.pagination.page,
          sortDir: 'asc',
          sortedBy: 'id',
          count:$scope.pagination.perPage
      };

      $scope.pagination.nextPage = function() {

          if ($scope.pagination.page < $scope.pagination.numPages) {
              $scope.pagination.page += 1;

              $scope.filterCriteria.pageNumber = $scope.pagination.page;
              $scope.filterCriteria.count = $scope.pagination.perPage;
              $scope.fetchResult();
          }
      };

      $scope.pagination.prevPage = function() {
          if ($scope.pagination.page > 0) {
              $scope.pagination.page -= 1;

              $scope.filterCriteria.pageNumber = $scope.pagination.page;
              $scope.filterCriteria.count = $scope.pagination.perPage;
              $scope.fetchResult();
          }
      };

      $scope.pagination.toPageId = function(id) {
          console.log('Id', id);
          if (id >= 0 && id <= $scope.pagination.page) {
              id++;
              $scope.pagination.page = id;

              $scope.filterCriteria.pageNumber = $scope.pagination.page;
              $scope.filterCriteria.count = $scope.pagination.perPage;

              $scope.fetchResult();
          }
      };

      $scope.helpful = function() {
          Api.articles.search({type:'article'}).then(function (data) {
              console.log('REST_ARTICLE', data);
              $scope.articleOpts = data;
//              console.log('ARt', $scope.articleOpts);
//              console.log($scope.totalPages);
          }, function () {
              console.log('REST_ARTICLE EMPTY');
          });

          Api.articles.search({type:'spec_price'}).then(function (data) {
              $scope.specPrice = data;
          }, function () {
          });

          Api.articles.search({type:'metering'}).then(function (data) {
              $scope.metering = data;
          }, function () {
          });

          Api.articles.search({type:'delivery'}).then(function (data) {
              $scope.delivery = data;
          }, function () {
          });

          Api.articles.search({type:'install'}).then(function (data) {
              $scope.install = data;
          }, function () {
          });

          Api.articles.search({type:'category'}).then(function (data) {
              $scope.categories = data;
          }, function () {
          });
      };

      $scope.helpful();
//
//      Api.headers.search($scope.filterCriteria).then(function (data) {
//          $scope.headers = data;
//          console.log('HEADERS', data);
//      }, function () {
//          $scope.headers = [];
//      });

//      console.log(':::::::::::::::::::::rout PAram', $routeParams);
      $scope.fetchResult = function () {

          if ($routeParams.hasOwnProperty('category') && !$scope.requestParams) {
              $scope.filterCriteria.category = $routeParams.category;
              $scope.requestParams = true;
          }
          $scope.promise = Api.products.search($scope.filterCriteria).then(function (data) {
              console.log('REST_PRODUCTS', data);
              $scope.products = data;
              $scope.filter = data.filter;
              console.log($scope.filter);
              $scope.totalPages = $scope.filterCriteria.pageNumber;
              $scope.customersCount = data.length;
              $scope.pagination.numPages = Math.ceil(data.meta.meta.total/$scope.pagination.perPage);

          }, function () {
              console.log('REST_PRODUCTS EMPTY');
              $scope.customers = [];
              $scope.totalPages = 0;
              $scope.customersCount = 0;
          });
      }


      console.log($scope.fetchResult());

      $scope.filterResult = function () {
          $scope.checked = $scope.filterCriteria;
//          console.log('------------->', $scope.filterCriteria);
          $scope.filterCriteria.pageNumber = 1;
          $scope.fetchResult();
          /*    $scope.fetchResult().then(function () {
           //The request fires correctly but sometimes the ui doesn't update, that's a fix
           $scope.filterCriteria.pageNumber = 1;
           });*/
      };

      $scope.empty = function () {
          $scope.filterCriteria = {
              pageNumber: 1,
              sortDir: 'asc',
              sortedBy: 'id',
              count:$scope.pagination.perPage
          };
          $scope.checked = [];
          $scope.fetchResult();
      }

//      $scope.input = Api.rows;

//      $scope.fetchResult = function () {
//          $scope.data = [];
//          $scope.headers = [];

//          console.log('filterCriteria', $scope.filterCriteria);
//          console.log('headers', $scope.headers);
//          if (!_.isEmpty($scope.filterCriteria)) {
//              console.log('exist search');
//              for (var key in $scope.input) {
//                  if ($scope.input[key].name === $scope.filterCriteria.name) {
//                      $scope.data.push($scope.input[key]);
//                      var header = Object.keys($scope.input[key]);
//                      header.splice(header.indexOf('$$hashKey'),1);
//                      $scope.headers = _.union($scope.headers, header);
//                  }
//              }
//          } else {
//              console.log('not search');
//              $scope.filterCriteria = {};
//              for (var key in $scope.input) {
//                  $scope.data.push($scope.input[key]);
//                  var header = Object.keys($scope.input[key]);
//                  $scope.headers = _.union($scope.headers, header);
//              }
//          }
//
//          console.log('header', $scope.headers);

//      };


//      $scope.products = Phone.query();
//    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone', 'Api', '_', 'DataService',
  function($scope, $routeParams, Phone, Api, _, DataService) {

      $scope.cart = DataService.cart;

      Api.products.get($routeParams).then(function (data) {
          console.log('GET_PRODUCT', data);
          $scope.product = data;

          if (data.url.length > 0) {
              $scope.mainImageUrl = data.url[0].image;
              console.log('change image', $scope.mainImageUrl);
          }




//          $scope.filter = data.filter;
//          console.log($scope.filter);
//          $scope.totalPages = $scope.filterCriteria.pageNumber;
//          $scope.customersCount = data.length;
      }, function () {
          console.log('GET_PRODUCT EMPTY');
//          $scope.customers = [];
//          $scope.totalPages = 0;
//          $scope.customersCount = 0;
      });

//    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
//      $scope.mainImageUrl = phone.images[0];
//    });
//




    $scope.setImage = function(imageUrl) {
        $scope.mainImageUrl = imageUrl;
        console.log('change image', $scope.mainImageUrl);
    }

  }]);


phonecatControllers.controller('ShoppingCartCtrl', ['$scope', '$routeParams', 'DataService', 'Api',
    function($scope, $routeParams, DataService, Api) {

            //http://jsfiddle.net/7MhLd/60/
        $scope.cart = DataService.cart;
        $scope.cart.orderproc = false;

        $scope.order = {
            name: '',
            email: '',
            phone: '',
            address: '',
            comments: ''
        };


/*
        $scope.getValue = function() {
            //here get the value of that inserted in the element with the id of "input_" + id
            return $scope.order;
        }
*/



        $scope.send = function () {
//            console.log($scope.order);
//            console.log('ITEMS', $scope.cart.items);
            Api.orders.post({order:$scope.order, data:$scope.cart.items}).then(function (data) {
//                console.log('POST ORDER', data);
//            $scope.order = data;

//            if (data.url.length > 0) {
//                $scope.mainImageUrl = data.url[0].image;
//                console.log('change image', $scope.mainImageUrl);
//            }
               $scope.cart.clearItems();
               $scope.cart.orderproc = true;
            }, function () {
                console.log('POST ORDER EMPTY', $routeParams);
            });
        };

//        $scope.phoneNumberPattern = (function() {
//            var regexp = /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/;
//            return {
//                test: function(value) {
//                    /*if( $scope.requireTel === false )*/ return true;
////            else return regexp.test(value);
//                }
//            };
//        })();



    }]);

phonecatControllers.controller('ArticleDetailCtrl', ['$scope', '$sce', '$routeParams', 'Api', '_',
    function($scope, $sce, $routeParams, Api, _) {

//        $scope.snippet =
//            '<p style="color:blue">an html\n' +
//                '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
//                'snippet</p>';

        Api.articles.get($routeParams).then(function (data) {
            console.log('GET_ARTICLE', data);
            $scope.article = data;

            $scope.deliberatelyTrustDangerousSnippet = function() {
                return $sce.trustAsHtml($scope.article.desc);
            };

        }, function () {
            console.log('GET_ARTICLE EMPTY');
        });



    }]);