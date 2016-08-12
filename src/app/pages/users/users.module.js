/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.users', []).config(routeConfig);
    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider.state('users', {
            url: '/users',
            template: '<ui-view></ui-view>',
            abstract: true,
            title: 'Users',
            sidebarMeta: {
                icon: 'ion-person',
                order: 100,
            },
        }).state('users.list', {
            url: '/list',
            templateUrl: 'app/pages/users/views/list.html',
            controller: 'UserListCtrl',
            title: 'Manage Users',
            sidebarMeta: {
                order: 0,
            },
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
            }
        });
        $urlRouterProvider.when('/users', '/users/list');
    }
})();