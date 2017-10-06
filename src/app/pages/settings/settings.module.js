/**
 * @author Anthony
 * created on 09.14.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings', []).config(routeConfig);
  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('settings', {
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
    $urlRouterProvider.when('/settings', '/settings/notification');
  }
})();
