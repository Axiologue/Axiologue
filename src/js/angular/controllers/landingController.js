angular.module('axiologue')
.controller('LandingCtrl', ['$scope', '$http', 'Settings', 
    function ($scope, $http, Settings) {
  $http.get(Settings.baseUrl).then(function (response) {
    var data = response.data;

    $scope.blog = data.blog;
    $scope.events = data.events;
    $scope.projects = data.axiologue_projects;
    $scope.friends = data.friends_projects;
  }, function (response) {
    console.log(response.data);
  });
}]);
