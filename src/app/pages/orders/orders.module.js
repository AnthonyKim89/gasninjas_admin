/**
 * @author Anthony
 * created on 06.08.2016
 * modified on the Oct 12, 2017 - User Role
 */
(function() {
  'use strict';

  var app = app || {};

  angular.module('GasNinjasAdmin.pages.orders', [])
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

        if (Auth.isAdmin() || Auth.isSuperadmin()) {
          dynamic_state.state('orders', {
            url: '/orders',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Orders',
            sidebarMeta: {
              icon: 'ion-flame',
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
              schedule: null
            },
            authenticate: true
          }).state('orders.complete', {
            url: '/complete/:order_id/:user_id',
            templateUrl: 'app/pages/orders/views/complete.html',
            controller: 'OrderCompleteCtrl',
            title: 'Complete Order',
            authenticate: true
          });
        } else if (Auth.isDriver()) {
          //This page is invoked from the Onfleet
          dynamic_state.state('orders-complete', {
            url: '/orders/complete/:order_id/:user_id',
            templateUrl: 'app/pages/orders/views/complete.html',
            controller: 'OrderCompleteCtrl',
            title: 'Complete Order',
            authenticate: true
          });
        }

        var states = dynamic_state.getAll();
        if (states.length > 0) {
          angular.forEach(states, function(state, index) {
            app.$stateProviderRef.state(state.name, state.options);
          });

          app.$urlRouterProviderRef.when('/orders', '/orders/list');

          $urlRouter.sync();
          $urlRouter.listen();
        }
      });
  }
})();