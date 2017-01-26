angular.module('axiologue')
.factory('Event', ['Settings', '$resource', function (Settings, $resource) {
  var services = {},
      _event = $resource(Settings.baseUrl + 'events/:eventID',{}, {
        all: {method: 'GET', params: {eventID: 'all'}, isArray: true},
        detail: {method: 'GET'}
      });

  services.all = function (success) {
    return _event.all({}, success);
  };

  services.detail = function (eventID, success) {
    return _event.detail({eventID: eventID}, success);
  };

  return services;
}]);
