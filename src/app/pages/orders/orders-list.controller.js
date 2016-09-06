/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.orders')
        .controller('OrderListCtrl', OrderListCtrl)
        .controller('BizOrderListCtrl', BizOrderListCtrl);

    /** @ngInject */
    function OrderListCtrl($scope, $state, $ngBootbox, toastr, SERVER_URL, OrderService) {
        $scope.pagination = {
            apiUrl: SERVER_URL + '/api/refills/list_orders',
            urlParams: {
                sort: 'created',
                direction: 'desc',
            },
            perPage: 5,
            page: 0,
            perPagePresets: [5, 10, 20, 50, 100],
            items: [],
        };
        $scope.viewUser = fnViewUser;
        $scope.addOrder = fnAddOrder;
        $scope.editOrder = fnEditOrder;
        $scope.deleteOrder = fnDeleteOrder;

        function fnViewUser(id) {
            $state.go('users.edit', {
                id: id
            });
        }

        function fnAddOrder() {
            $state.go('orders.new');
        }

        function fnEditOrder(order) {
            $state.go('orders.edit', { id: order.id });
        }

        function fnDeleteOrder(id) {
            $ngBootbox.confirm('Are you sure you want to delete this order?')
                .then(function() {
                    OrderService.deleteOrder({ id: id }, fnCallbackDeleteOrder);
                }, function() {

                });
        }

        function fnCallbackDeleteOrder(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully deleted the order!');
                    $state.go('orders.list', {}, { reload: true });
                    break;
                case 0:
                    toastr.error('Failed to delete the order!');
                    break;
                case -1:
                    toastr.warning('Successfully deleted the order, but failed to send to the Onfleet!');
                    break;
            }
        }
    }

    function BizOrderListCtrl($scope, $state, $ngBootbox, toastr, SERVER_URL, OrderService) {
        $scope.pagination = {
            apiUrl: SERVER_URL + '/api/refills/list_orders/biz',
            urlParams: {
                sort: 'created',
                direction: 'desc',
            },
            perPage: 5,
            page: 0,
            perPagePresets: [5, 10, 20, 50, 100],
            items: [],
        };
        $scope.viewUser = fnViewUser;
        $scope.addOrder = fnAddOrder;
        $scope.editOrder = fnEditOrder;
        $scope.deleteOrder = fnDeleteOrder;

        function fnViewUser(id) {
            $state.go('users.edit', {
                id: id
            });
        }

        function fnAddOrder() {
            $state.go('orders.new');
        }

        function fnEditOrder(order) {
            $state.go('orders.edit', { id: order.id });
        }

        function fnDeleteOrder(id) {
            $ngBootbox.confirm('Are you sure you want to delete this order?')
                .then(function() {
                    OrderService.deleteOrder({ id: id }, fnCallbackDeleteOrder);
                }, function() {

                });
        }

        function fnCallbackDeleteOrder(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully deleted the order!');
                    $state.go('orders.list', {}, { reload: true });
                    break;
                case 0:
                    toastr.error('Failed to delete the order!');
                    break;
                case -1:
                    toastr.warning('Successfully deleted the order, but failed to send to the Onfleet!');
                    break;
            }
        }
    }
})();
