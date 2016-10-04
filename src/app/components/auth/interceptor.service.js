/**
 * @author Anthony
 * created on 19.08.2016
 */

 'use strict';

(function() {

  function authInterceptor($rootScope, $q, $cookies, $injector, Util, SERVER_URL) {
    var state;
    return {
      // Add authorization token to headers
      request: function(config) {
        config.headers = config.headers || {};
        //if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if (response.status === 401) {
          (state || (state = $injector.get('$state')))
          .go('login');
          // remove any stale tokens
          $cookies.remove('token');
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('GasNinjasAdmin.components.auth')
    .factory('authInterceptor', authInterceptor);
})();
