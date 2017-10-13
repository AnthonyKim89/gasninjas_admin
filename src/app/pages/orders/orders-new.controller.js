/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders')
    .controller('OrderNewCtrl', OrderNewCtrl);

  function OrderNewCtrl($scope, $state, $http, $timeout, toastr, lodash, appConfig, OrganizationService, UserService, OrderService) {
    $scope.addOrder = fnAddOrder;
    $scope.fetchUsers = fnFetchUsers;
    $scope.fetchOrganizations = fnFetchOrganizations;
    $scope.placeChanged = fnHandlerOnPlaceChanged;
    $scope.centerChanged = fnHandlerOnCenterChanged;
    $scope.initGoogleMap = fnInitGoogleMap;
    $scope.initScheduler = fnInitScheduler;

    $scope.isSubmitting = false;

    $scope.organizations = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true
    };
    $scope.users = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true,
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
      delivery_window_id: '',
      day_interval: 0,
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

    $scope.$watch('organizations.selected', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.users.selected = null;
      $scope.users.hasMore = true;

      if (newVal) {
        $scope.delivery_windows.list = newVal.delivery_windows;
      }

      $scope.fetchUsers(null);
    });

    $scope.$watch('users.selected', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.vehicles.selected = null;

      if (newVal && newVal.id) {
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
      }
    });

    $scope.$watch('vehicles.selected', function(newVal, oldVal) {
      if (newVal === oldVal || newVal == null) return;
      $scope.order.gas_type = parseInt(newVal.gas_type);

      $scope.prices.selected = lodash.find($scope.prices.list, { gas_type: $scope.order.gas_type });
    })

    function fnAddOrder() {
      var scheduler = $('#myScheduler').scheduler('value');

      if (!$scope.users.selected) {
        alert("Please select a user.");
        return;
      }
      if (!$scope.vehicles.selected) {
        alert("Please select a vehicle.");
        return;
      }
      if (!$scope.delivery_windows.selected) {
        alert("Please select a delivery window.");
        return;
      }
      if (!$scope.prices.selected) {
        alert("Please select a price.");
        return;
      }

      $scope.order.user_id = $scope.users.selected.id;
      $scope.order.vehicle_id = $scope.vehicles.selected.id;
      $scope.order.delivery_window_id = $scope.delivery_windows.selected.id;
      $scope.order.day_interval = $scope.delivery_windows.selected.day_interval;
      $scope.order.gas_type = $scope.prices.selected.gas_type;
      $scope.order.price = $scope.prices.selected.price;

      var data = {
        organization_id: $scope.organizations.selected ? $scope.organizations.selected.id : 0,
        user_id: $scope.users.selected.id,
        vehicle_id: $scope.vehicles.selected.id,
        parking_address: $scope.order.parking_address,
        gas_type: $scope.order.gas_type,
        price_per_gallon: $scope.order.price,
        delivery_window_id: $scope.order.delivery_window_id,
        day_interval: $scope.order.day_interval,
        notes: $scope.order.notes,

        zip: $scope.order.zip,
        latlong: $scope.order.latlong,
        country: $scope.order.country ? $scope.order.country : ' ',
        city: $scope.order.city ? $scope.order.city : ' ',
        street_name: $scope.order.street_name ? $scope.order.street_name : ' ',
        street_number: $scope.order.street_number ? $scope.order.street_number : ' ',

        recurrencePattern: scheduler.recurrencePattern !== 'FREQ=DAILY;INTERVAL=1;COUNT=1' ? scheduler.recurrencePattern : '',

        skip_onfleet: !$scope.order.send_to_onfleet ? 1 : 0
      };

      $scope.isSubmitting = true;
      OrderService.addNewOrder(data, fnCallbackAddNew);

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

      var organization_id = 0;

      if ($scope.organizations.selected) {
        organization_id = $scope.organizations.selected.id;
      }

      UserService.getUserList({ organization_id: organization_id }, {
        query_email: $select ? $select.search : '',
        page: $scope.users.page,
        limit: 10
      }).$promise.then(function(response) {
        $scope.users.page++;
        $scope.users.list = $scope.users.list.concat(response);
        if (response.length < 10)
          $scope.users.hasMore = false;
        $scope.users.loading = false;
      }).catch(function(response) {
        $scope.users.hasMore = false;
        $scope.users.loading = false;
      });
    }

    function fnFetchOrganizations($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.organizations.page = 1;
        $scope.organizations.list = [{
          id: 0,
          name: '----------------------------------------------'
        }];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.organizations.loading = true;

      $http({
        method: 'GET',
        url: appConfig.API_URL + '/organizations/list_organizations',
        params: {
          query: $select.search,
          page: $scope.organizations.page,
          limit: 10
        }
      }).then(function(response) {
        $scope.organizations.list = $scope.organizations.list.concat(response.data);

        $scope.organizations.page++;

        if (response.data.length < 10)
          $scope.organizations.hasMore = false;
      })['finally'](function() {
        $scope.organizations.loading = false;
      });
    }

    function fnCallbackAddNew(result) {
      $scope.isSubmitting = false;

      if (result.success) {
        toastr.info('Successfully added a new order!');
        $state.go('orders.list');
      } else {
        toastr.error(result.message ? result.message : 'Failed to add a new order!');
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

      if ($scope.marker) {
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
        if (!$scope.organizations.selected)
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