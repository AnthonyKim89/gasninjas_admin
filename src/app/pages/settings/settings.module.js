/**
 * @author Anthony
 * created on 09.14.2017
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var $stateProviderRef = null;
  var $urlRouterProviderRef = null;

  angular.module('GasNinjasAdmin.pages.settings', [])
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
          }).state('settings.notification', {
            url: '/notification',
            templateUrl: 'app/pages/settings/views/notification.html',
            controller: 'SettingsNotificationCtrl',
            title: 'Push Notification',
            sidebarMeta: {
              order: 0,
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
            resolve: {
              data: function(VersionService) {
                return VersionService.getVersionInfo().$promise;
              }
            },
            authenticate: true
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            $stateProviderRef.state(state.name, state.options);
          });

          $urlRouterProviderRef.when('/settings', '/settings/notification');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();