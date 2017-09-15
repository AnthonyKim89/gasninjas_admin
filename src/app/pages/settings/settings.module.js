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
        order: 400,
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
    });
    $urlRouterProvider.when('/settings', '/settings/notification');
  }
})();
