/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.login', [])
    .config(routeConfig)
    .run(function($rootScope) {
      $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
        if (next.name === 'logout' && current && current.name && !current.authenticate) {
          next.referrer = current.name;
        }
      });
    });
  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
      url: '/login',
      title: 'Sign In',
      fixedHref: 'auth.html',
      controller: 'LoginCtrl'
    }).state('logout', {
      url: '/logout?referrer',
      referrer: 'dashboard',
      template: '',
      controller: function($state, Auth) {
        Auth.logout();
        location.href = 'auth.html';
      }
    });
  }
})();