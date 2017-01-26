angular.module('axiologue')
.controller('BlogDetailCtrl', ['$scope', 'Blog', '$routeParams', function ($scope, Blog, $routeParams) {
  $scope.post = Blog.getPost($routeParams.postName);
}]);

angular.module('axiologue')
.controller('BlogListCtrl', ['$scope', 'Blog', function ($scope, Blog) {
  $scope.posts = Blog.list();
}]);
