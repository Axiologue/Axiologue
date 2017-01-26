angular.module('axiologue')
.factory('Blog', ['Settings', '$resource', function (Settings, $resource) {
  var services = {},
      _blogAPI = $resource(Settings.baseUrl + 'blog/posts/:postID/', {}, {
        list: {method: 'GET', params: {postID: 'all'}, isArray: true},
        detail: {method: 'GET'}
      });

  services.list = function () {
    return _blogAPI.list();
  };

  services.getPost = function (postName) {
    return _blogAPI.detail({postID: postName});
  };

  return services;
}]);
