/**
 * @author Anthony
 * created on 06.08.2016
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.users', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('users', {
          url: '/users',
          template : '<ui-view></ui-view>',
          abstract: true,
          controller: 'UsersListCtrl',
          title: 'Users',
          sidebarMeta: {
            icon: 'ion-person',
            order: 100,
          },
        }).state('users.list', {
          url: '/list',
          templateUrl: 'app/pages/users/list/index.html',
          title: 'Manage Users',
          sidebarMeta: {
            order: 0,
          },
        });
    $urlRouterProvider.when('/users','/users/list');
  }

})();
