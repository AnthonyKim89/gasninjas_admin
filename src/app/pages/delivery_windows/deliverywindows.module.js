/**
 * @author Anthony
 * created on 09.19.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.delivery_windows', []).config(routeConfig);
  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('delivery_windows', {
      url: '/delivery_windows',
      template: '<ui-view></ui-view>',
      abstract: true,
      title: 'Delivery Windows',
      sidebarMeta: {
        icon: 'ion-person-stalker',
        order: 400,
      },
      authenticate: true
    }).state('delivery_windows.list', {
      url: '/list',
      templateUrl: 'app/pages/delivery_windows/views/list.html',
      controller: 'DeliveryWindowListCtrl',
      title: 'Manage Delivery Windows',
      sidebarMeta: {
        order: 0,
      },
      authenticate: true
    }).state('delivery_windows.new', {
      url: '/new',
      templateUrl: 'app/pages/delivery_windows/views/new.html',
      controller: 'DeliveryWindowNewCtrl',
      title: 'Add a New Delivery Window',
      sidebarMeta: {
        order: 100,
      },
      authenticate: true
    }).state('delivery_windows.edit', {
      url: '/edit/:id',
      templateUrl: 'app/pages/delivery_windows/views/edit.html',
      controller: 'DeliveryWindowEditCtrl',
      resolve: {
        data: function(DeliveryWindowService, $stateParams) {
          return DeliveryWindowService.getDeliveryWindowInfo({
            id: $stateParams.id
          }).$promise;
        }
      },
      authenticate: true
    });
    $urlRouterProvider.when('/delivery_windows', '/delivery_windows/list');
  }
})();
