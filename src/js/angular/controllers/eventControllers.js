angular.module('axiologue')
.controller('EventListCtrl', ['$scope', 'Event', function ($scope, Event) {
  var parseData = function (response) {
    $scope.events = response;
  };
  
  Event.all(parseData);
}]);

angular.module('axiologue')
.controller('EventDetailCtrl', ['$scope', 'Event', '$routeParams', '$sce', 
    function ($scope, Event, $routeParams, $sce) {

  var parseData = function (response) {
    var base = 'https://www.google.com/maps/embed/v1/search?key=AIzaSyD6zHQAOKSj1H1zVuxD6S7AII5aeLaEiHc&q=';
    $scope.eventInfo = response;
    $scope.mapsUrl= $sce.trustAsResourceUrl(base + response.location.street_address.replace(/\s/g, '+') + '+' + response.location.city.replace(/\s/g, '+'));
  };

  $scope.eventInfo = Event.detail($routeParams.eventID, parseData);

}]);
