'use strict';

var app = angular.module('axiologue', [
    'ngRoute',
    'ngResource',
    'hc.marked',
]);


app.config(['$resourceProvider', '$locationProvider', '$httpProvider',
    function($resourceProvider, $locationProvider, $httpProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
}]);


app.config(['$routeProvider',
  function($routeProvider) { 
    $routeProvider
      .when('/', {
        templateUrl: 'templates/landing.html',
        controller: 'LandingCtrl'
      })
      .when('/about', {
        templateUrl: 'templates/about.html',
      })
      .when('/blog/all', {
        controller: 'BlogListCtrl',
        templateUrl: 'templates/blog_list.html'
      })
      .when('/blog/post/:postName', {
        controller: 'BlogDetailCtrl',
        templateUrl: 'templates/blog_detail.html'
      })
      .when('/events/all', {
        controller: 'EventListCtrl',
        templateUrl: 'templates/event_list.html'
      })
      .when('/events/event/:eventID', {
        controller: 'EventDetailCtrl',
        templateUrl: 'templates/event_detail.html'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
