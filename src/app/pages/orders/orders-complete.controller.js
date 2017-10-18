/**
 * @author Anthony
 * created on Oct 17, 2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders')
    .controller('OrderCompleteCtrl', OrderCompleteCtrl);

  function OrderCompleteCtrl($scope, $state, $q, $timeout, $ngBootbox, $stateParams, toastr, lodash, appConfig, UserService, OrderService) {
    $scope.onDataLoaded = fnOnDataLoaded;
    $scope.onDataLoadFailed = fnOnDataLoadFailed;
    $scope.next = fnNext;
    $scope.suspend = fnSuspend;
    $scope.refillMore = fnRefillMore;
    $scope.completeRefill = fnCompleteRefill;

    $scope.isSubmitting = false;
    $scope.today = new Date();

    $q.all([
      OrderService.getOrderInfo({ id: $stateParams.order_id }).$promise,
      UserService.getUserInfo({ id: $stateParams.user_id }).$promise
    ]).then($scope.onDataLoaded).catch($scope.onDataLoadFailed);

    function fnOnDataLoaded(data) {
      $scope.order = data[0];
      $scope.user = data[1].user;
      $scope.vehicles = {
        list: $scope.user.vehicles,
        page: 1,
        selected: $scope.user.vehicles.length ? $scope.user.vehicles[0] : null,
        loading: false,
        hasMore: false
      };
      $scope.refills = [];

      // Check if the order is not fulfilled yet.
      if ($scope.order.status == 5 || $scope.order.status == 10) {
        toastr.error('The order has been already ' + ($scope.order.status == 10 ? 'completed.' : 'canceled.'));
        $state.go('dashboard');
        return;
      } else if ($scope.order.status !== 1) {
        toastr.error('Failed to load the order details from the server.');
        $state.go('dashboard');
        return;
      }

      $scope.$watch('refills', function(newVal, oldVal) {
        if (newVal == oldVal) return;

        var vehicles_unfiled = [];
        angular.forEach($scope.user.vehicles, function(vehicle, index) {
          var objRefill = $scope.refills.find(function(object) {
            return object.vehicle_id === vehicle.id;
          });
          if (!objRefill) {
            vehicles_unfiled.push(vehicle);
          }
        });

        $scope.vehicles.list = vehicles_unfiled;
        $scope.vehicles.selected = vehicles_unfiled.length ? vehicles_unfiled[0] : null;
      }, true);
    }

    function fnOnDataLoadFailed() {
      toastr.error('Failed to load the order details from the server.');
      $state.go('dashboard');
    }

    function fnNext() {
      var options = {
        message: 'Are you sure to complete the order?',
        title: 'Complete Order',
        onEscape: function() {},
        scope: $scope,
        animate: true,
        backdrop: false,
        buttons: {
          warning: {
            label: $scope.vehicles.list.length > 1 ? "More Vehicles" : "Not Yet",
            className: "btn-default",
            callback: $scope.refillMore
          },
          success: {
            label: "Complete",
            className: "btn-primary",
            callback: $scope.completeRefill
          }
        }
      };

      $ngBootbox.customDialog(options);
    }

    function fnSuspend() {

    }

    function fnCompleteRefill() {
      $scope.refills.push({
        vehicle_id: $scope.vehicles.selected.id,
        vehicle_tag: $scope.vehicles.selected.tag,
        gas_type: $scope.vehicles.selected.gas_type,
        gallon: $scope.vehicles.selected.gallon,
      });

      var data = {
        success: true,
        notes: ""
      };

      angular.forEach($scope.refills, function(item, index) {
        if (index > 0) data.notes += "\n";
        data.notes += item.gallon + " GAL " + item.gas_type + " " + item.vehicle_tag;
      });

      $scope.isSubmitting = true;
      OrderService.completeOrder({ id: $scope.order.id }, data, fnCallbackCompleteOrder);
    }

    function fnRefillMore() {
      if ($scope.vehicles.list.length > 1) {
        $timeout(function() {
          $scope.$apply(function() {
            $scope.refills.push({
              vehicle_id: $scope.vehicles.selected.id,
              vehicle_tag: $scope.vehicles.selected.tag,
              gas_type: $scope.vehicles.selected.gas_type,
              gallon: $scope.vehicles.selected.gallon,
            });
          });
        });
      }
    }

    function fnCallbackCompleteOrder(result) {
      $scope.isSubmitting = false;

      if (result.success == 1) {
        toastr.info('Successfully completed the order!');
        $state.go('dashboard');
      } else {
        $timeout(function() {
          $scope.$apply(function() {
            $scope.refills = [];

          });
        });
        toastr.error(result.message ? result.message : 'Failed to complete the order!');
      }
    }
  }
})();