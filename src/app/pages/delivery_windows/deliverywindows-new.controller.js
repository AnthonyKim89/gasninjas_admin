/**
 * @author Anthony
 * created on 09.19.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.delivery_windows')
    .controller('DeliveryWindowNewCtrl', DeliveryWindowNewCtrl)

  /** @ngInject */
  function DeliveryWindowNewCtrl($scope, $state, $timeout, toastr, lodash, DeliveryWindowService, DeliveryWindowUtil) {
    $scope.delivery_window = {
      key: '',
      text: '',
      price: 0,
      cutoff: '',
      threshold: '',
      slot_from: '',
      slot_to: '',
      popup: '',
      is_active: true,
      active_days: []
    };
    $scope.addDeliveryWindow = fnAddDeliveryWindow;
    $scope.initDateTimePicker = fnInitDateTimePicker;

    $scope.initDateTimePicker();

    function fnInitDateTimePicker() {
      var is_loaded1 = $('#from').attr('date-format');
      var is_loaded2 = $('#to').attr('date-format');

      if (is_loaded1 && is_loaded2) {
        try {
          $('#from').datetimepicker({
            format: 'LT'
          });
          $('#to').datetimepicker({
            format: 'LT'
          });
        } catch (error) {
          console.error(error);
          $('#from').datetimepicker();
          $('#to').datetimepicker();
        }
      } else {
        $timeout(fnInitDateTimePicker, 500);
      }
    }

    function fnAddDeliveryWindow() {

      var data = {
        key: $scope.delivery_window.key,
        text: $scope.delivery_window.text,
        price: $scope.delivery_window.price,
        cutoff: $scope.delivery_window.cutoff,
        threshold: $scope.delivery_window.threshold,
        popup: $scope.delivery_window.popup,
        slot_from: $("#from").val(),
        slot_to: $("#to").val(),
        is_active: $scope.delivery_window.is_active,
        active_days: DeliveryWindowUtil.convertActiveDaysFromArrayToDBString($scope.delivery_window.active_days)
      };

      DeliveryWindowService.addDeliveryWindow(data, fnCallbackAddNew);

      return false;
    }

    function fnCallbackAddNew(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully added a new Delivery Window!');
          $state.go('delivery_windows.list');
          break;
        case 0:
          toastr.error('Failed to add a new Delivery Window!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }

})();