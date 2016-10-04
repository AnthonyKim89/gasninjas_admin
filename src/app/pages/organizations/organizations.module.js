/**
 * @author Anthony
 * created on 02.09.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.organizations', []).config(routeConfig);
  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('organizations', {
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
          return UserService.getAvailableUsers().$promise;
        }
      },
      authenticate: true
    });
    $urlRouterProvider.when('/organizations', '/organizations/list');
  }
})();
