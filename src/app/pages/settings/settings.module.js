/**
 * @author Anthony
 * created on 09.14.2017
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.settings', [])
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
          dynamic_state.state('settings', {
            url: '/settings',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Settings',
            sidebarMeta: {
              icon: 'ion-android-settings',
              order: 999,
            },
            authenticate: true
          }).state('settings.app-version', {
            url: '/app-version',
            templateUrl: 'app/pages/settings/views/app-version.html',
            controller: 'AppVersionCtrl',
            title: 'App Version',
            sidebarMeta: {
              order: 100,
            },
            authenticate: true
          }).state('settings.zone-list', {
            url: '/zone-list',
            templateUrl: 'app/pages/settings/views/zone-list.html',
            controller: 'ZoneListCtrl',
            title: 'KML-based Zones',
            sidebarMeta: {
              order: 300,
            },
            authenticate: true
          }).state('settings.zone-add', {
            url: '/zone-add',
            templateUrl: 'app/pages/settings/views/zone-add.html',
            controller: 'ZoneAddCtrl',
            title: 'Add a new KML-based Zone',
            authenticate: true
          });
        }

        if (Auth.isSuperadmin()) {
          dynamic_state.state('settings.zipcode-area', {
            url: '/zipcode-area',
            templateUrl: 'app/pages/settings/views/zipcode-area.html',
            controller: 'ZipcodeAreaCtrl',
            title: 'Zipcode Area',
            sidebarMeta: {
              order: 200,
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