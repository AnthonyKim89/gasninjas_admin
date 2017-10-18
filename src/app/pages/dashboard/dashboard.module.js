/**
 * @author v.lugovsky
 * created on 16.12.2015
 *
 * modified by Anthony on the Oct 12, 2017
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.dashboard', [])
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
          dynamic_state.state('dashboard', {
            url: '/dashboard',
            templateUrl: 'app/pages/dashboard/dashboard.html',
            title: 'Dashboard',
            sidebarMeta: {
              icon: 'ion-android-home',
              order: 0,
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