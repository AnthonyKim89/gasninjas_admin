/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages', [
    'ui.router',

    'GasNinjasAdmin.pages.dashboard',
    'GasNinjasAdmin.pages.users',
    'GasNinjasAdmin.pages.orders',
  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    $urlRouterProvider.otherwise('/dashboard');
  }

})();
