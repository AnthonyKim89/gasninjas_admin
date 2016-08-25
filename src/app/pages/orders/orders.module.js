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
                order: 200,
            },
        }).state('orders.list', {
            url: '/list',
            templateUrl: 'app/pages/orders/views/list.html',
            controller: 'OrderListCtrl',
            title: 'Manage Orders',
            sidebarMeta: {
                order: 0,
            },
        }).state('orders.new', {
            url: '/new',
            templateUrl: 'app/pages/orders/views/new.html',
            controller: 'OrderNewCtrl',
            title: 'Manage Orders'
        }).state('orders.edit', {
            url: '/edit',
            templateUrl: 'app/pages/orders/views/edit.html',
            controller: 'OrderEditCtrl',
            title: 'Manage Orders',
            params: {
                order: null
            }
        });
        $urlRouterProvider.when('/orders', '/orders/list');
    }
})();