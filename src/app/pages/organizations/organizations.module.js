/**
 * @author Anthony
 * created on 02.09.2016
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var $stateProviderRef = null;
  var $urlRouterProviderRef = null;

  angular.module('GasNinjasAdmin.pages.organizations', [])
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
          dynamic_state.state('organizations', {
            url: '/organizations',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Organizations',
            sidebarMeta: {
              icon: 'ion-person-stalker',
              order: 100,
            },
            authenticate: true
          }).state('organizations.list', {
            url: '/list',
            templateUrl: 'app/pages/organizations/views/list.html',
            controller: 'OrganizationListCtrl',
            title: 'Manage Organizations',
            sidebarMeta: {
              order: 0,
            },
            authenticate: true
          }).state('organizations.new', {
            url: '/new',
            templateUrl: 'app/pages/organizations/views/new.html',
            controller: 'OrganizationNewCtrl',
            title: 'Add a New Organization',
            sidebarMeta: {
              order: 100,
            },
            authenticate: true
          }).state('organizations.edit', {
            url: '/edit/:id',
            templateUrl: 'app/pages/organizations/views/edit.html',
            controller: 'OrganizationEditCtrl',
            resolve: {
              data: function(OrganizationService, $stateParams) {
                return OrganizationService.getOrganizationInfo({
                  id: $stateParams.id
                }).$promise;
              },
              available_users: function(UserService) {
                return UserService.getAvailableUsers({}, { purpose: 'organization' }).$promise;
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

          $urlRouterProviderRef.when('/organizations', '/organizations/list');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();