/**
 * @author Anthony
 * created on the Oct 22, 2017
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.driver_inspection', [])
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

        if (Auth.isDriver() && !Auth.isAdmin() && !Auth.isSuperadmin()) {
          dynamic_state.state('driver-inspection', {
            url: '/driver_inspection',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Driver Inspection',
            sidebarMeta: {
              icon: 'ion-ios-compose-outline',
              order: 2,
            },
            authenticate: true
          }).state('driver-inspection.pre-trip', {
            url: '/pre-trip',
            templateUrl: 'app/pages/driver_inspection/views/pre-trip.html',
            controller: 'InspectionResponseCtrl',
            title: 'Pre Trip Inspection',
            sidebarMeta: {
              order: 1,
            },
            params: {
              category_id: 1
            },
            authenticate: true
          }).state('driver-inspection.post-trip', {
            url: '/post-trip',
            templateUrl: 'app/pages/driver_inspection/views/post-trip.html',
            controller: 'InspectionResponseCtrl',
            title: 'Post Trip Inspection',
            sidebarMeta: {
              order: 2,
            },
            params: {
              category_id: 2
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