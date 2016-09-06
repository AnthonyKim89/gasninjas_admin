/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.orders')
        .controller('ScheduleListCtrl', ScheduleListCtrl);

    /** @ngInject */
    function ScheduleListCtrl($scope, $state, $ngBootbox, toastr, SERVER_URL, OrderService) {
        $scope.pagination = {
            apiUrl: SERVER_URL + '/api/refills/list_orders/schedule',
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
        $scope.editOrder = fnEditOrder;
        $scope.editSchedule = fnEditSchedule;
        $scope.deleteSchedule = fnDeleteSchedule;

        function fnViewUser(id) {
            $state.go('users.edit', {
                id: id
            });
        }

        function fnEditOrder(order) {
            $state.go('orders.edit', { id: order.id });
        }

        function fnEditSchedule(order) {
            $state.go('orders.edit_schedule', { order: order });
        }

        function fnDeleteSchedule(id) {
            $ngBootbox.confirm('Are you sure you want to delete this schedule?')
                .then(function() {
                    OrderService.deleteSchedule({ id: id }, fnCallbackDeleteSchedule);
                }, function() {

                });
        }

        function fnCallbackDeleteSchedule(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully deleted the schedule!');
                    $state.go('orders.list_schedules', {}, { reload: true });
                    break;
                case 0:
                    toastr.error('Failed to delete the schedule!');
                    break;
                default:
                    toastr.warning(result.message ? result.message : 'Unknown Server Error!');
                    break;
            }
        }
    }
})();
