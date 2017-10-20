/**
 * @author Anthony
 * created on Oct 17, 2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders')
    .controller('OrderCompleteCtrl', OrderCompleteCtrl);

  function OrderCompleteCtrl($scope, $state, $q, $timeout, $ngBootbox, $stateParams, $window, toastr, lodash, appConfig, UserService, OrderService) {
    $scope.onDataLoaded = fnOnDataLoaded;
    $scope.onDataLoadFailed = fnOnDataLoadFailed;
    $scope.next = fnNext;
    $scope.suspend = fnSuspend;
    $scope.refillMore = fnRefillMore;
    $scope.completeRefill = fnCompleteRefill;
    $scope.moveScroll = fnMoveScroll;
    $scope.increasePanelBody = fnIncreasePanelBody;

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

      $scope.isNumpadOpen = true;
      $("input.numpad-input").numpad({
        hidePlusMinusButton: true,
        decimalSeparator: '.',
        appendKeypadTo: $('#numpad_container'),
        position: 'absolute',
        textCancel: 'Close',
        onKeypadOpen: function() {
          $timeout(function() {
            $scope.isNumpadOpen = true;
            $scope.$apply();
          });
        },
        onKeypadClose: function() {
          $timeout(function() {
            $scope.isNumpadOpen = false;
            $scope.$apply();
          });
        },
        onChange: function(event, value) {
          $timeout(function() {
            if (!value)
              $scope.vehicles.selected.gallon = "";
            else
              $scope.vehicles.selected.gallon = parseFloat(value).toFixed(2);
            $scope.$apply();
          });
        }
      });
      $timeout(function() {
        $scope.moveScroll();
        $scope.increasePanelBody();
        $("input.numpad-input").click();
      });

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

    function fnMoveScroll() {
      var elemBreadcrumb = angular.element('.breadcrumb')[0];
      var elemPanelHeading = angular.element('.panel-heading')[0];
      if (typeof elemBreadcrumb != "undefined" && typeof elemPanelHeading != "undefined") {
        var rectBreadcrumb = elemBreadcrumb.getBoundingClientRect();
        var rectPanelHeading = elemPanelHeading.getBoundingClientRect();
        var doc = elemBreadcrumb.ownerDocument;
        var docElem = doc.documentElement;
        var top = rectBreadcrumb.top + $window.pageYOffset + docElem.clientTop;
        //iPhone5
        if (docElem.clientWidth <= 430) {
          top+= rectPanelHeading.height + 30;
        } else {
          top-= 10;
        }
        window.scrollTo(0, top);

        // blur the navigation bar
        angular.element('.page-top').addClass('transparent-bg');
      };
    }

    function fnIncreasePanelBody() {
      var elemPanelBody = angular.element('.full-height .panel-body')[0];
      if (typeof elemPanelBody != "undefined") {
        var rectPanelBody = elemPanelBody.getBoundingClientRect();
        var doc = elemPanelBody.ownerDocument;
        var docElem = doc.documentElement;
        var vertical_space = docElem.clientHeight - rectPanelBody.height;
        var threshold = 270;
        //iPad
        if (docElem.clientWidth <= 768) {
          threshold = 250;
        }
        
        if (vertical_space - threshold > 0) {
          var new_height = rectPanelBody.height + vertical_space - threshold;
          angular.element('.full-height .panel-body').css('height', new_height + 'px');
        }
      }
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
      $ngBootbox.confirm('Are you sure you want to suspend this task on the Onfleet?')
        .then(function() {
          $scope.isSubmitting = true;

          OrderService.suspendOrder({ id: $scope.order.id }, fnCallbackSuspendOrder);
        });
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

    function fnCallbackSuspendOrder(result) {
      $scope.isSubmitting = false;

      if (result.success == 1) {
        toastr.info('Successfully suspended the Onfleet Task!');
        $state.go('dashboard');
      } else {
        toastr.error(result.message ? result.message : 'Failed to suspend the Onfleet task!');
      }
    }
  }
})();