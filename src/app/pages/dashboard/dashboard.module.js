/**
 * @author v.lugovsky
 * created on 16.12.2015
 *
 * modified by Anthony on the Oct 12, 2017
 */
(function() {
  'use strict';

  var $stateProviderRef = null;
  var $urlRouterProviderRef = null;

  angular.module('GasNinjasAdmin.pages.dashboard', [])
    .config(routeConfig)
    .run(moduleRun);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProviderRef = $stateProvider;
    $urlRouterProviderRef = $urlRouterProvider;
  }

  function moduleRun($q, $urlRouter, Auth, DynamicState) {
    Auth.isLoggedIn(_.noop)
      .then(function(is) {
        var dynamic_state = new DynamicState.init();

        if (Auth.hasRole('admin') || Auth.hasRole('superadmin')) {
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
            $stateProviderRef.state(state.name, state.options);
          });

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }

})();