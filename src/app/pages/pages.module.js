/**
 * @author v.lugovsky
 * created on 16.12.2015
 * 
 * modified on 14 Sep 2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages', [
      'ui.router',

      'GasNinjasAdmin.components',
      'GasNinjasAdmin.models',

      'GasNinjasAdmin.pages.login',
      'GasNinjasAdmin.pages.dashboard',
      'GasNinjasAdmin.pages.organizations',
      'GasNinjasAdmin.pages.users',
      'GasNinjasAdmin.pages.orders',
      'GasNinjasAdmin.pages.b2bfuel',
      'GasNinjasAdmin.pages.delivery_windows',
      'GasNinjasAdmin.pages.customercare',
      'GasNinjasAdmin.pages.settings',
    ])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
  }

})();
