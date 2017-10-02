/**
 * @author Anthony
 * created on 09.19.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.delivery_windows')
    .controller('DeliveryWindowListCtrl', DeliveryWindowListCtrl);

  /** @ngInject */
  function DeliveryWindowListCtrl($scope, $state, $ngBootbox, toastr, lodash, appConfig, DeliveryWindowService) {
    $scope.addDeliveryWindow = fnAddDeliveryWindow;
    $scope.editDeliveryWindow = fnEditDeliveryWindow;
    $scope.deleteDeliveryWindow = fnDeleteDeliveryWindow;
    $scope.getDeliveryWindows = fnGetDeliveryWindows;

    $scope.init = function() {
      $scope.pagination = {
        apiUrl: appConfig.API_URL + '/delivery_windows/list_delivery_windows',
        urlParams: {
          sort: 'id',
          direction: 'asc',
          query: ''
        },
        perPage: 10,
        page: 0,
        perPagePresets: [5, 10, 20, 50, 100],
        items: [],
      };
    };

    $scope.init();

    function fnAddDeliveryWindow(id) {
      $state.go('delivery_windows.new');
    }

    function fnEditDeliveryWindow(id) {
      $state.go('delivery_windows.edit', { id: id });
    }

    function fnDeleteDeliveryWindow(id) {
      $ngBootbox.confirm('Are you sure you want to delete this slot?')
        .then(function() {
          DeliveryWindowService.deleteDeliveryWindow({ id: id }, fnCallbackDeleteDeliveryWindow);
        }, function() {

        });
    }

    function fnGetDeliveryWindows(delivery_windows) {
      //return lodash.join(lodash.map(delivery_windows, 'text'), "\n");
      return lodash.map(delivery_windows, 'text');
    }

    function fnCallbackDeleteDeliveryWindow(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully deleted the slot!');
          $state.go('delivery_windows.list', {}, { reload: true });
          break;
        case 0:
          toastr.error('Failed to delete the slot!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }

})();