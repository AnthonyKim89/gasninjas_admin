/**
 * @author Anthony
 * created on 09.19.2017
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.delivery_windows', [])
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

        if (Auth.hasRole('admin') || Auth.hasRole('superadmin')) {
          dynamic_state.state('delivery_windows', {
            url: '/delivery_windows',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Delivery Windows',
            sidebarMeta: {
              icon: 'ion-clock',
              order: 400,
            },
            authenticate: true
          }).state('delivery_windows.list', {
            url: '/list',
            templateUrl: 'app/pages/delivery_windows/views/list.html',
            controller: 'DeliveryWindowListCtrl',
            title: 'Manage Delivery Windows',
            sidebarMeta: {
              order: 0,
            },
            authenticate: true
          }).state('delivery_windows.new', {
            url: '/new',
            templateUrl: 'app/pages/delivery_windows/views/new.html',
            controller: 'DeliveryWindowNewCtrl',
            title: 'Add a New Delivery Window',
            sidebarMeta: {
              order: 100,
            },
            authenticate: true
          }).state('delivery_windows.edit', {
            url: '/edit/:id',
            templateUrl: 'app/pages/delivery_windows/views/edit.html',
            controller: 'DeliveryWindowEditCtrl',
            authenticate: true
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            app.$stateProviderRef.state(state.name, state.options);
          });

          app.$urlRouterProviderRef.when('/delivery_windows', '/delivery_windows/list');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();