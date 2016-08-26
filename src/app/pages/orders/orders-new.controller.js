/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.orders')
        .controller('OrderNewCtrl', OrderNewCtrl);

    function OrderNewCtrl($scope, $state, $http, $timeout, toastr, lodash, UserService, OrderService) {
        $scope.addOrder = fnAddOrder;
        $scope.fetchUsers = fnFetchUsers;
        $scope.placeChanged = fnHandlerOnPlaceChanged;
        $scope.centerChanged = fnHandlerOnCenterChanged;
        $scope.initGoogleMap = fnInitGoogleMap;
        $scope.initScheduler = fnInitScheduler;

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
            list: [],
            page: 1,
            selected: null,
            loading: false,
        };
        $scope.prices = {
            list: [],
            page: 1,
            selected: null,
            loading: false,
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
            send_to_onfleet: true,
            zip: '',
            latlong: '',
            country: '',
            city: '',
            street_name: '',
            street_number: '',
        };
        $scope.marker = null;

        $timeout($scope.initGoogleMap, 100);

        $timeout($scope.initScheduler, 1000);

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

            $scope.prices.selected = lodash.find($scope.prices.list, { gas_type: $scope.order.gas_type });
        })

        function fnAddOrder() {
            var scheduler = $('#myScheduler').scheduler('value');

            if (!$scope.users.selected){
                alert("Please select a user.");
                return;
            }
            if (!$scope.vehicles.selected){
                alert("Please select a vehicle.");
                return;
            }
            if (!$scope.delivery_windows.selected){
                alert("Please select a delivery window.");
                return;
            }
            if (!$scope.prices.selected){
                alert("Please select a price.");
                return;
            }

            $scope.order.user_id = $scope.users.selected.id;
            $scope.order.vehicle_id = $scope.vehicles.selected.id;
            $scope.order.to_deliver_on = $scope.delivery_windows.selected.key;
            $scope.order.gas_type = $scope.prices.selected.gas_type;
            $scope.order.price = $scope.prices.selected.price;

            var data = {
                user_id: $scope.users.selected.id,
                vehicle_id: $scope.vehicles.selected.id,
                parking_address: $scope.order.parking_address,
                gas_type: $scope.order.gas_type,
                price_per_gallon: $scope.order.price,
                to_deliver_on: $scope.order.to_deliver_on,
                notes: $scope.order.notes,
                
                zip: $scope.order.zip,
                latlong: $scope.order.latlong,
                country: $scope.order.country,
                city: $scope.order.city,
                street_name: $scope.order.street_name,
                street_number: $scope.order.street_number,

                repeat: {
                    startDateTime: new Date(scheduler.startDateTime).getTime() / 1000,
                    timeZone: scheduler.timeZone.offset,
                    recurrencePattern: scheduler.recurrencePattern
                }
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
                default:
                    toastr.error(result.message ? result.message : 'Unknown Server Error');
                    break;
            }
        }

        function fnInitScheduler() {
            $('#myScheduler').scheduler();
        }

        function fnInitGoogleMap() {
            var mapCanvas = document.getElementById('google-maps');
            var mapOptions = {
                center: new google.maps.LatLng(44.5403, -78.5463),
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(mapCanvas, mapOptions);

            $scope.map = map;

            $scope.infoWindow = new google.maps.InfoWindow({ map: map });
            $scope.infoWindow.close();

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        map.setCenter(pos);
                    },
                    function() {
                        fnHandleLocationError(true, $scope.infoWindow, $scope.map.getCenter());
                    }
                );
            } else {
                // Browser doesn't support Geolocation
                fnHandleLocationError(false, $scope.infoWindow, $scope.map.getCenter());
            }

            $scope.searchBox = new google.maps.places.SearchBox(document.getElementById('parking_address'));

            google.maps.event.addListener($scope.searchBox, 'places_changed', $scope.placeChanged);
            
            map.addListener('bounds_changed', $scope.centerChanged);
            map.addListener('dragend', $scope.centerChanged);
        }

        function fnHandleLocationError(browserHasGeolocation, infoWindow, pos) {

            if (browserHasGeolocation) {
                var content = "Error: The Geolocation service failed.";
            } else {
                var content = "Error: Your browser doesn't support geolocation.";
            }
        }

        function fnHandlerOnPlaceChanged() {
            var places = $scope.searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            var bounds = new google.maps.LatLngBounds();

            for (var i = 0, place; place = places[i]; i++) {
                bounds.extend(place.geometry.location);
            }

            $scope.map.fitBounds(bounds);
            $scope.map.setZoom(8);

            $scope.centerChanged();
        }

        function fnHandlerOnCenterChanged() {
            var geocoder = new google.maps.Geocoder;
            var pos = $scope.map.getCenter();

            if ($scope.marker){
                $scope.marker.setMap(null);
            }

            $scope.marker = new google.maps.Marker({
                position: pos,
                map: $scope.map
            });

            geocoder.geocode({ latLng: pos }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var objZip = lodash.find(results[0].address_components, { types: ['postal_code'] });
                        var objCountry = lodash.find(results[0].address_components, { types: ['country'] });
                        var objCity = lodash.find(results[0].address_components, { types: ['locality'] });
                        var objStreetName = lodash.find(results[0].address_components, { types: ['route'] });
                        var objStreetNumber = lodash.find(results[0].address_components, { types: ['street_number'] });
                        $scope.order.parking_address = results[0].formatted_address;
                        $scope.order.zip = objZip ? objZip['long_name'] : '';
                        $scope.order.country = objCountry ? objCountry['long_name'] : '';
                        $scope.order.city = objCity ? objCity['long_name'] : '';
                        $scope.order.street_name = objStreetName ? objStreetName['long_name'] : '';
                        $scope.order.street_number = objStreetNumber ? objStreetNumber['long_name'] : '';
                        $scope.order.latlong = pos.lat() + ',' + pos.lng();

                        var data = {
                            zip: $scope.order.zip,
                            lat: pos.lat(),
                            lng: pos.lng()
                        };
                        OrderService.getPrices(data, fnCallbackGetPrices);
                    } else {
                        $scope.order.parking_address = '';
                        $scope.order.zip = '';
                        $scope.order.country = '';
                        $scope.order.city = '';
                        $scope.order.street_name = '';
                        $scope.order.street_number = '';
                        $scope.order.latlong = '';
                    }
                }
            });
        }

        function fnCallbackGetPrices(result) {
            if (result && result.success) {
                $scope.delivery_windows.list = result.prices.windows;
                $scope.prices.list = [];
                $scope.prices.list[0] = {
                    gas_type: 87,
                    price: result.prices['87'],
                    text: 'Regular - 87 $' + parseFloat(result.prices['87']).toFixed(2) + '/gal'
                };
                $scope.prices.list[93] = {
                    gas_type: 93,
                    price: result.prices['93'],
                    text: 'Premium - 93 $' + parseFloat(result.prices['93']).toFixed(2) + '/gal'
                };

                if ($scope.order.gas_type)
                    $scope.prices.selected = lodash.find($scope.prices.list, { gas_type: $scope.order.gas_type });
            } else {
                $scope.delivery_windows.list = [];
                $scope.prices.list = [];
            }
        }
    }
})();
