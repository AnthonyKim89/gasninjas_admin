/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.orders')
        .controller('OrderListCtrl', OrderListCtrl)
        .controller('OrderNewCtrl', OrderNewCtrl)
        .controller('OrderEditCtrl', OrderEditCtrl);
    
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
            $state.go('orders.edit', {order: order});
        }

        function fnDeleteOrder(id) {
            $ngBootbox.confirm('Are you sure you want to delete this order?')
                .then(function() {
                    OrderService.deleteOrder({id: id}, fnCallbackDeleteOrder);
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

    function OrderNewCtrl($scope, $state, $http, $timeout, toastr, UserService, OrderService, DeliveryWindows) {
        $scope.addOrder = fnAddOrder;
        $scope.fetchUsers = fnFetchUsers;
        $scope.initDateTimePicker = fnInitDateTimePicker;
        $scope.users = {
            list: [],
            page: 1,
            selected: null,
            loading: false
        };
        $scope.vehicles = {
            list: [],
            page: 1,
            selected: null,
            loading: false
        };
        $scope.delivery_windows = {
            list: DeliveryWindows,
            page: 1,
            selected: null,
            loading: false
        };
        $scope.order = {
            parking_address: '',
            gas_type: '',
            gallons: 0,
            price: 0,
            to_deliver_on: '',
            delivered_on: '',
            notes: '',
            status: '',
            send_to_onfleet: true
        };
        $scope.initDateTimePicker();
        $scope.$watch('users.selected', function(newVal, oldVal) {
            if (newVal === oldVal) return;
            $scope.vehicles.selected = null;
            UserService.getUserInfo({
                id: newVal.id
            }).$promise.then(function(data) {
                for (var i = 0, len = data.user.vehicles.length; i < len; i++) {
                    data.user.vehicles[i].name = data.user.vehicles[i].make + " - " + data.user.vehicles[i].color + " - " + data.user.vehicles[i].gas_type;
                }
                $scope.vehicles.list = data.user.vehicles;
            }).catch(function(err) {
                console.error('Failed to Load User Info from the API Server', err);
                toastr.error('Failed to Load User Info from the API Server');
            });
        });
        $scope.$watch('vehicles.selected', function(newVal, oldVal) {
            if (newVal === oldVal || newVal == null) return;
            $scope.order.gas_type = parseInt(newVal.gas_type);
        })

        function fnInitDateTimePicker() {
            var is_loaded = $('#delivered_on').attr('date-format');
            if (is_loaded) {
                $('#delivered_on').datetimepicker();
            } else {
                $timeout(fnInitDateTimePicker, 500);
            }
        }

        function fnAddOrder() {
            $scope.order.user_id = $scope.users.selected.id;
            $scope.order.vehicle_id = $scope.vehicles.selected.id;
            $scope.order.to_deliver_on = $scope.delivery_windows.selected.key;
            $scope.order.delivered_on = $("#delivered_on").val();
            var date = new Date($scope.order.delivered_on);
            var data = {
                user_id: $scope.users.selected.id,
                vehicle_id: $scope.vehicles.selected.id,
                parking_address: $scope.order.parking_address,
                // gas_type: $scope.order.gas_type,
                // gallons: $scope.order.gallons,
                // price: $scope.order.price,
                to_deliver_on: $scope.order.to_deliver_on,
                delivered_on: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    hour: date.getHours(),
                    minute: date.getMinutes()
                },
                // notes: $scope.order.notes,
                // status: $scope.order.status
            };
            
            if ($scope.order.send_to_onfleet) {
                OrderService.addNewOrderWithOnfleet(data, fnCallbackAddNew);
            } else {
                OrderService.addNewOrder(data, fnCallbackAddNew);
            }
            return false;
        }

        function fnFetchUsers($select, $event) {
            // no event means first load!
            if (!$event) {
                $scope.users.page = 1;
                $scope.users.list = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
            }
            $scope.users.loading = true;
            $http({
                method: 'GET',
                url: SERVER_URL + '/api/users/list_users',
                params: {
                    query_email: $select.search,
                    page: $scope.users.page
                }
            }).then(function(response) {
                $scope.users.page++;
                $scope.users.list = $scope.users.list.concat(response.data);
            })['finally'](function() {
                $scope.users.loading = false;
            });
        }

        function fnCallbackAddNew(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully added a new order!');
                    $state.go('orders.list');
                    break;
                case 0:
                    toastr.error('Failed to add a new order!');
                    break;
                case -1:
                    toastr.warning('Successfully added a new order, but failed to send to the Onfleet!');
                    break;
            }
        }
    }

    function OrderEditCtrl($scope, $state, $http, $timeout, $ngBootbox, toastr, UserService, OrderService, DeliveryWindows) {
        if ($state.params.order){
            $scope.order = {
                id: $state.params.order.id,
                user_id: $state.params.order.user_id,
                vehicle_id: $state.params.order.vehicle_id,
                parking_address: $state.params.order.parking_address,
                gas_type: parseInt($state.params.order.gas_type),
                gallons: $state.params.order.gallons,
                price: $state.params.order.price,
                to_deliver_on: $state.params.order.to_deliver_on,
                delivered_on: $state.params.order.delivered_on,
                notes: $state.params.order.notes,
                status: $state.params.order.status,
                user: $state.params.order.user
            };
        }else{
            $state.go('orders.list');
        }

        if ($scope.order && typeof $scope.order.complete === 'undefined'){
            $scope.order.complete = true;
        }

        $scope.editOrder = fnEditOrder;
        $scope.completeOrder = fnCompleteOrder;
        $scope.deleteOrder = fnDeleteOrder;
        $scope.fetchUsers = fnFetchUsers;
        $scope.initDateTimePicker = fnInitDateTimePicker;
        $scope.users = {
            list: [],
            page: 1,
            selected: $scope.order? $scope.order.user : null,
            loading: false
        };
        $scope.vehicles = {
            list: [],
            page: 1,
            selected: null,
            loading: false
        };
        $scope.delivery_windows = {
            list: DeliveryWindows,
            page: 1,
            selected: null,
            loading: false
        };

        if (DeliveryWindows && $scope.order){
            for (var i=0; i<DeliveryWindows.length; i++){
                if (DeliveryWindows[i].key === $scope.order.to_deliver_on)
                    $scope.delivery_windows.selected = DeliveryWindows[i];
            }
        }
        
        $scope.initDateTimePicker();
        $scope.$watch('users.selected', function(newVal, oldVal) {
            if (newVal === null) return;

            $scope.vehicles.selected = null;
            UserService.getUserInfo({
                id: newVal.id
            }).$promise.then(function(data) {
                for (var i = 0, len = data.user.vehicles.length; i < len; i++) {
                    data.user.vehicles[i].name = data.user.vehicles[i].make + " - " + data.user.vehicles[i].color + " - " + data.user.vehicles[i].gas_type;

                    if ($scope.order.vehicle_id === data.user.vehicles[i].id){
                        $scope.vehicles.selected = data.user.vehicles[i];
                    }
                }
                $scope.vehicles.list = data.user.vehicles;
            }).catch(function(err) {
                console.error('Failed to Load User Info from the API Server', err);
                toastr.error('Failed to Load User Info from the API Server');
            });
        });
        $scope.$watch('vehicles.selected', function(newVal, oldVal) {
            if (newVal === oldVal || newVal == null) return;
            $scope.order.gas_type = parseInt(newVal.gas_type);
        });

        function fnInitDateTimePicker() {
            var is_loaded = $('#delivered_on').attr('date-format');
            if (is_loaded) {
                $('#delivered_on').datetimepicker();
            } else {
                $timeout(fnInitDateTimePicker, 500);
            }
        }

        function fnEditOrder() {
            $scope.order.user_id = $scope.users.selected.id;
            $scope.order.vehicle_id = $scope.vehicles.selected.id;
            $scope.order.to_deliver_on = $scope.delivery_windows.selected.key;
            $scope.order.delivered_on = $("#delivered_on").val();
            
            var date = new Date($scope.order.delivered_on);
            
            var data = {
                user_id: $scope.order.user_id,
                vehicle_id: $scope.order.vehicle_id,
                parking_address: $scope.order.parking_address,
                // gas_type: $scope.order.gas_type,
                // gallons: $scope.order.gallons,
                // price: $scope.order.price,
                to_deliver_on: $scope.order.to_deliver_on,
                delivered_on: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    hour: date.getHours(),
                    minute: date.getMinutes()
                },
                // notes: $scope.order.notes,
                // status: $scope.order.status
            };
            
            OrderService.editOrder({id: $scope.order.id}, data, fnCallbackEditOrder);
            return false;
        }

        function fnCompleteOrder() {
            var data = {
                user_id: $scope.order.user_id,
                gas_type: $scope.order.gas_type,
                gallons: $scope.order.gallons ? $scope.order.gallons : 0,
                price: $scope.order.price ? $scope.order.price : 0,
                // to_deliver_on: $scope.order.to_deliver_on,
                notes: $scope.order.notes ? $scope.order.notes : '',
                status: $scope.order.complete? 10: 5
            };

            OrderService.editOrder({id: $scope.order.id}, data, fnCallbackEditOrder);
            return false;
        }

        function fnFetchUsers($select, $event) {
            // no event means first load!
            if (!$event) {
                $scope.users.page = 1;
                $scope.users.list = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
            }
            $scope.users.loading = true;
            $http({
                method: 'GET',
                url: SERVER_URL + '/api/users/list_users',
                params: {
                    query_email: $select.search,
                    page: $scope.users.page
                }
            }).then(function(response) {
                $scope.users.page++;
                $scope.users.list = $scope.users.list.concat(response.data);
            })['finally'](function() {
                $scope.users.loading = false;
            });
        }

        function fnCallbackEditOrder(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully edited the order!');
                    break;
                case 0:
                    toastr.error('Failed to edit the order!');
                    break;
                case -1:
                    toastr.warning('Successfully edited the order, but failed to send to the Onfleet!');
                    break;
            }
        }

        function fnDeleteOrder() {
            $ngBootbox.confirm('Are you sure you want to delete this order?')
                .then(function() {
                    OrderService.deleteOrder({id: $scope.order.id}, fnCallbackDeleteOrder);
                }, function() {
                    
                });
        }

        function fnCallbackDeleteOrder(result) {
            switch (result.success) {
                case 1:
                    toastr.info('Successfully deleted the order!');
                    $state.go('orders.list');
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