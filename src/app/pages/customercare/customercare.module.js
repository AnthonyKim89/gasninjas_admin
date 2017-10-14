/**
 * @author Anthony
 * created on 09.14.2017
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.customercare', [])
    .config(routeConfig)
    .run(moduleRun);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    app.$stateProviderRef = $stateProvider;
    app.$urlRouterProviderRef = $urlRouterProvider;
  }

  function moduleRun($q, $urlRouter, Auth, DynamicState) {
    Auth.isLoggedIn(_.noop)
      .then(function(is) {
        var dynamic_state = new DynamicState.init();

        if (Auth.isAdmin() || Auth.isSuperadmin()) {
          dynamic_state.state('customercare', {
            url: '/customer-interaction',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Customer Care',
            sidebarMeta: {
              icon: 'ion-chatbubble-working',
              order: 900,
            },
            authenticate: true
          }).state('customercare.notification', {
            url: '/notification',
            templateUrl: 'app/pages/customercare/views/notification.html',
            controller: 'PushNotificationCtrl',
            title: 'Push Notification',
            sidebarMeta: {
              order: 1,
            },
            authenticate: true
          }).state('customercare.add-balance', {
            url: '/add-balance',
            templateUrl: 'app/pages/customercare/views/add-balance.html',
            controller: 'AddBalanceCtrl',
            title: 'Give Credits',
            sidebarMeta: {
              order: 2,
            },
            authenticate: true
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            app.$stateProviderRef.state(state.name, state.options);
          });

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();