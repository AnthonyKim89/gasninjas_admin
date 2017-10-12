/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders')
    .controller('ScheduleListCtrl', ScheduleListCtrl);

  /** @ngInject */
  function ScheduleListCtrl($scope, $state, $ngBootbox, toastr, appConfig, OrderService) {
    $scope.pagination = {
      apiUrl: appConfig.API_URL + '/refills/list_schedules',
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

    function fnViewUser(user_id) {
      $state.go('users.edit', {
        id: user_id
      });
    }

    function fnEditOrder(order_id) {
      $state.go('orders.edit', { id: order_id });
    }

    function fnEditSchedule(schedule) {
      $state.go('orders.edit_schedule', { schedule: schedule });
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