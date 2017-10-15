/**
 * @author Anthony
 * created on the Oct 12, 2017
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.b2bfuel', [])
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

        if (Auth.hasRole('driver') || Auth.hasRole('admin') || Auth.hasRole('superadmin')) {
          dynamic_state.state('b2bfuel', {
            url: '/b2bfuel',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'B2B Fuel',
            sidebarMeta: {
              icon: 'ion-model-s',
              order: Auth.hasRole('driver') ? 1 : 900,
            },
            authenticate: true
          }).state('b2bfuel.data-entry', {
            url: '/data-entry',
            templateUrl: 'app/pages/b2bfuel/views/data-entry.html',
            controller: 'B2BDataEntryCtrl',
            title: 'Data Entry',
            sidebarMeta: {
              order: 1,
            },
            authenticate: true
          }).state('b2bfuel.new-location', {
            url: '/new-location',
            templateUrl: 'app/pages/b2bfuel/views/new-location.html',
            controller: 'B2BNewLocationCtrl',
            title: 'New Location',
            sidebarMeta: {
              order: 100,
            },
            authenticate: true
          });
        }

        if (Auth.hasRole('driver') && !Auth.hasRole('admin') && !Auth.hasRole('superadmin')) {
          dynamic_state.state('dashboard', {
            url: '/b2bfuel/data-entry',
            template: '<ui-view></ui-view>',
            redirectTo: 'b2bfuel.data-entry',
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            app.$stateProviderRef.state(state.name, state.options);
          });

          app.$urlRouterProviderRef.when('/b2bfuel', '/b2bfuel/data-entry');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();