/**
 * @author Anthony
 * created on 06.08.2016
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.users', [])
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
          dynamic_state.state('users', {
            url: '/users',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Users',
            sidebarMeta: {
              icon: 'ion-person',
              order: 200,
            },
            authenticate: true
          }).state('users.list', {
            url: '/list',
            templateUrl: 'app/pages/users/views/list.html',
            controller: 'UserListCtrl',
            title: 'Manage Users',
            sidebarMeta: {
              order: 0,
            },
            authenticate: true
          }).state('users.edit', {
            url: '/edit/:id',
            templateUrl: 'app/pages/users/views/edit.html',
            controller: 'UserEditCtrl',
            authenticate: true
          });
        }

        if (Auth.hasRole('superadmin')) {
          dynamic_state.state('users.roles-list', {
            url: '/role-list',
            templateUrl: 'app/pages/users/views/roles-list.html',
            controller: 'UserRolesListCtrl',
            title: 'Manage User Roles',
            sidebarMeta: {
              order: 99,
            },
            authenticate: 'superadmin'
          }).state('users.roles-edit', {
            url: '/role-edit/:id',
            templateUrl: 'app/pages/users/views/roles-edit.html',
            controller: 'UserRolesEditCtrl',
            authenticate: 'superadmin'
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            app.$stateProviderRef.state(state.name, state.options);
          });

          app.$urlRouterProviderRef.when('/users', '/users/list');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();