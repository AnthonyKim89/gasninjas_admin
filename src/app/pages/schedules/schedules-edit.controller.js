/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.orders')
        .controller('ScheduleEditCtrl', ScheduleEditCtrl);

    function ScheduleEditCtrl($scope, $state, $http, $timeout, $ngBootbox, toastr, lodash, UserService, OrderService) {
        $scope.order = {};

        $scope.editSchedule = fnEditSchedule;
        $scope.deleteSchedule = fnDeleteSchedule;
        $scope.initScheduler = fnInitScheduler;

        if (!$state.params.order) {
            $state.go('orders.list_schedules');
        } else {
            $scope.order = {
                id: $state.params.order.id,
                
                refill_schedule: $state.params.order.refill_schedule
            };
        }

        $timeout($scope.initScheduler, 500);

        function fnEditSchedule() {
            var scheduler = $('#myScheduler').scheduler('value');

            var date = new Date(scheduler.startDateTime);
            var offsetMins = date.getTimezoneOffset();
            var new_date = new Date(date.getTime() + offsetMins * 60 * 1000);

            var data = {
                repeat: {
                    startDateTime: date.getTime() / 1000,
                    timeZone: scheduler.timeZone.offset,
                    recurrencePattern: scheduler.recurrencePattern,
                    active: $scope.order.refill_schedule.active
                }
            };

            OrderService.editOrder({ id: $scope.order.id }, data, fnCallbackEditSchedule);
            return false;
        }

        function fnCallbackEditSchedule(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully updated the schedule!');
                    break;
                case 0:
                    toastr.error('Failed to update the schedule!');
                    break;
                case 2:
                    toastr.warning(result.message ? result.message : 'Unknown Server Error!');
                    break;
            }
        }

        function fnDeleteSchedule() {
            $ngBootbox.confirm('Are you sure you want to delete this schedule?')
                .then(function() {
                    OrderService.fnDeleteSchedule({ id: $scope.order.refill_schedule.id }, fnCallbackDeleteSchedule);
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

        function fnInitScheduler() {
            $('#myScheduler').scheduler();

            if ($scope.order && $scope.order.refill_schedule) {
                $('#myScheduler').scheduler('value', {
                    startDateTime: $scope.order.refill_schedule.startDateTime,
                    timeZone: {
                        offset: $scope.order.refill_schedule.timeZone
                    },
                    recurrencePattern: $scope.order.refill_schedule.recurrencePattern
                });
            }
        }
    }
})();
