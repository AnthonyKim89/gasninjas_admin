/**
 * @author Anthony
 * created on 09.19.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.delivery_windows')
    .controller('DeliveryWindowEditCtrl', DeliveryWindowEditCtrl);

  /** @ngInject */
  function DeliveryWindowEditCtrl($scope, $state, $ngBootbox, $timeout, $stateParams, toastr, lodash, DeliveryWindowService, DeliveryWindowUtil) {
    $scope.editDeliveryWindow = fnEditDeliveryWindow;
    $scope.initDateTimePicker = fnInitDateTimePicker;

    $scope.onDataLoaded = fnOnDataLoaded;

    DeliveryWindowService.getDeliveryWindowInfo({
      id: $stateParams.id
    }).$promise.then($scope.onDataLoaded);

    function fnOnDataLoaded(data) {
      if (data) {
        $scope.delivery_window = {
          id: data.delivery_window.id,
          key: data.delivery_window.key,
          text: data.delivery_window.text,
          price: data.delivery_window.price,
          cutoff: data.delivery_window.cutoff,
          threshold: data.delivery_window.threshold,
          popup: data.delivery_window.popup,
          slot_from: data.delivery_window.slot_from,
          slot_to: data.delivery_window.slot_to,
          is_active: data.delivery_window.is_active,
          active_days: DeliveryWindowUtil.convertActiveDaysFromDBStringToArray(data.delivery_window.active_days)
        };

        $scope.initDateTimePicker();
      } else {
        toastr.error('Failed to load the DeliveryWindow Info from the API Server');
        $state.go('delivery_windows.list');
      }
    }

    function fnInitDateTimePicker() {
      var is_loaded1 = $('#from').attr('date-format');
      var is_loaded2 = $('#to').attr('date-format');

      if (is_loaded1 && is_loaded2) {
        try {
          $("#from").val($scope.delivery_window.slot_from);
          $("#to").val($scope.delivery_window.slot_to);

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

    function fnEditDeliveryWindow() {
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

      DeliveryWindowService.editDeliveryWindow({ id: $scope.delivery_window.id }, data, fnCallbackEditDeliveryWindow);

      return false;
    }

    function fnCallbackEditDeliveryWindow(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully updated the Delivery Window!');
          $state.go('delivery_windows.list');
          break;
        case 0:
          toastr.error('Failed to update the Delivery Window!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }
})();