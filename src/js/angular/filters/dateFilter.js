angular.module('axiologue')
.filter('dateFormat', [function () {
  return function (dateString) {
    var date = new Date(dateString);
    return date.toLocaleString();
  };
}]);
