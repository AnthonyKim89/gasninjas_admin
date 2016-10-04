/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders', []).config(routeConfig);
  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('orders', {
      url: '/orders',
      template: '<ui-view></ui-view>',
      abstract: true,
      title: 'Orders',
      sidebarMeta: {
        icon: 'ion-pull-request',
        order: 300,
      },
      authenticate: true
    }).state('orders.list', {
      url: '/list',
      templateUrl: 'app/pages/orders/views/list.html',
      controller: 'OrderListCtrl',
      title: 'Manage Orders',
      sidebarMeta: {
        order: 0,
      },
      authenticate: true
    }).state('orders.list_biz', {
      url: '/list_biz',
      templateUrl: 'app/pages/orders/views/list_biz.html',
      controller: 'BizOrderListCtrl',
      title: 'Manage Biz Orders',
      sidebarMeta: {
        order: 50,
      },
      authenticate: true
    }).state('orders.new', {
      url: '/new',
      templateUrl: 'app/pages/orders/views/new.html',
      controller: 'OrderNewCtrl',
      title: 'Add a New Order',
      sidebarMeta: {
        order: 150,
      },
      authenticate: true
    }).state('orders.edit', {
      url: '/edit/:id',
      templateUrl: 'app/pages/orders/views/edit.html',
      controller: 'OrderEditCtrl',
      title: 'Manage Orders',
      resolve: {
        data: function(OrderService, $stateParams) {
          return OrderService.getOrderInfo({
            id: $stateParams.id
          }).$promise;
        }
      },
      authenticate: true
    }).state('orders.list_schedules', {
      url: '/list_schedules',
      templateUrl: 'app/pages/schedules/views/list.html',
      controller: 'ScheduleListCtrl',
      title: 'Manage Schedules',
      sidebarMeta: {
        order: 100,
      },
      authenticate: true
    }).state('orders.edit_schedule', {
      url: '/edit_schedule',
      templateUrl: 'app/pages/schedules/views/edit.html',
      controller: 'ScheduleEditCtrl',
      title: 'Manage Schedules',
      params: {
        order: null
      },
      authenticate: true
    });
    $urlRouterProvider.when('/orders', '/orders/list');
  }
})();
