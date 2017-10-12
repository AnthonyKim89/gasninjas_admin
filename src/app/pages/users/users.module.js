/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';

  var $stateProviderRef = null;
  var $urlRouterProviderRef = null;

  angular.module('GasNinjasAdmin.pages.users', [])
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
            resolve: {
              data: function(UserService, $stateParams) {
                return UserService.getUserInfo({
                  id: $stateParams.id
                }).$promise;
              }
            },
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
            url: '/roles-edit/:id',
            templateUrl: 'app/pages/users/views/roles-edit.html',
            controller: 'UserRolesEditCtrl',
            resolve: {
              data: function(UserService, $stateParams) {
                return UserService.getRoleInfo({
                  id: $stateParams.id
                }).$promise;
              },
              available_users: function(UserService, $stateParams) {
                return UserService.getAvailableUsers({}, { purpose: 'role', id: $stateParams.id }).$promise;
              }
            },
            authenticate: 'superadmin'
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            $stateProviderRef.state(state.name, state.options);
          });

          $urlRouterProviderRef.when('/users', '/users/list');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();