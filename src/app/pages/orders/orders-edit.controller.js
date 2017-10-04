/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.orders')
    .controller('OrderEditCtrl', OrderEditCtrl);

  function OrderEditCtrl($scope, $state, $http, $timeout, $ngBootbox, toastr, lodash, appConfig, UserService, OrderService, data) {
    $scope.order = {};

    $scope.editOrder = fnEditOrder;
    $scope.completeOrder = fnCompleteOrder;
    $scope.deleteOrder = fnDeleteOrder;
    $scope.fetchOrganizations = fnFetchOrganizations;
    $scope.fetchUsers = fnFetchUsers;
    $scope.initDateTimePicker = fnInitDateTimePicker;
    $scope.initGoogleMap = fnInitGoogleMap;
    $scope.initScheduler = fnInitScheduler;
    $scope.placeChanged = fnHandlerOnPlaceChanged;
    $scope.centerChanged = fnHandlerOnCenterChanged;
    $scope.isOrderPending = fnIsOrderPending;

    $scope.isSubmitting = false;

    if (!data || !data.id) {
      $state.go('orders.list');
    } else {
      var dateScheduledAt = new Date(data.scheduled_at);

      $scope.order = {
        id: data.id,
        user_id: data.user_id,
        vehicle_id: data.vehicle_id,
        parking_address: data.parking_address,
        gas_type: parseInt(data.gas_type),
        gallons: data.gallons,
        price_per_gallon: data.price_per_gallon,
        delivery_window_id: data.delivery_window_id,
        delivered_on: data.delivered_on,
        notes: data.notes,
        completion_notes: '',
        status: data.status,
        organization: data.organization,
        user: data.user,
        task_id: data.task_id,
        send_to_onfleet: data.task_id ? true : false,

        zip: data.zip,
        latlong: data.latlong,
        country: data.country,
        city: data.city,
        street_name: data.street_name,
        street_number: data.street_number,

        refill_schedule: data.refill_schedule,

        scheduled_at: "After " + dateScheduledAt.toLocaleTimeString() + ", on " + dateScheduledAt.toLocaleDateString(),
      };

      $scope.initDateTimePicker();
    }

    if ($scope.order && typeof $scope.order.complete === 'undefined') {
      $scope.order.complete = true;
    }

    $scope.organizations = {
      list: [],
      page: 1,
      selected: $scope.order ? $scope.order.organization : null,
      loading: false,
      hasMore: true
    };
    $scope.users = {
      list: [],
      page: 1,
      selected: $scope.order ? $scope.order.user : null,
      loading: false,
      hasMore: true
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
      loading: false
    };
    $scope.prices = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
    };
    $scope.marker = null;

    $timeout($scope.initGoogleMap, 500);
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
      if (!newVal) return;

      $scope.vehicles.selected = null;

      if (newVal && newVal.id) {
        UserService.getUserInfo({
          id: newVal.id
        }).$promise.then(function(data) {
          for (var i = 0, len = data.user.vehicles.length; i < len; i++) {
            data.user.vehicles[i].name = data.user.vehicles[i].make + " - " + data.user.vehicles[i].color + " - " + data.user.vehicles[i].gas_type;

            if ($scope.order.vehicle_id === data.user.vehicles[i].id) {
              $scope.vehicles.selected = data.user.vehicles[i];
            }
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
    });

    function fnInitDateTimePicker() {
      var is_loaded = $('#delivered_on').attr('date-format');
      if (is_loaded && $scope.order) {
        try {
          $('#delivered_on').datetimepicker({
            defaultDate: new Date($scope.order.delivered_on)
          });
        } catch (error) {
          console.error(error);
          $('#delivered_on').datetimepicker();
        }

      } else {
        $timeout(fnInitDateTimePicker, 500);
      }
    }

    function fnEditOrder() {
      //We can't edit already completed order!
      if ($scope.order.status == 10 || $scope.order.status == 5)
        return false;

      var scheduler = $('#myScheduler').scheduler('value');

      if (!$scope.users.selected) {
        alert("Please select a user.");
        return;
      }
      if (!$scope.vehicles.selected) {
        alert("Please select a vehicle.");
        return;
      }
      // if (!$scope.delivery_windows.selected) {
      //   alert("Please select a delivery window.");
      //   return;
      // }
      if (!$scope.prices.selected) {
        alert("Please select a price.");
        return;
      }

      $scope.order.user_id = $scope.users.selected.id;
      $scope.order.vehicle_id = $scope.vehicles.selected.id;
      // $scope.order.to_deliver_on = $scope.delivery_windows.selected.key;
      $scope.order.delivered_on = $("#delivered_on").val();
      $scope.order.gas_type = $scope.prices.selected.gas_type;
      $scope.order.price = $scope.prices.selected.price;

      var date = new Date($('#delivered_on').val());
      var offsetMins = date.getTimezoneOffset();
      var new_date = new Date(date.getTime() + offsetMins * 60 * 1000);

      var data = {
        organization_id: $scope.organizations.selected ? $scope.organizations.selected.id : 0,
        user_id: $scope.users.selected.id,
        vehicle_id: $scope.vehicles.selected.id,
        parking_address: $scope.order.parking_address,
        gas_type: $scope.order.gas_type,
        price_per_gallon: $scope.order.price,
        // to_deliver_on: $scope.order.to_deliver_on,
        notes: $scope.order.notes,

        zip: $scope.order.zip,
        latlong: $scope.order.latlong,
        country: $scope.order.country,
        city: $scope.order.city,
        street_name: $scope.order.street_name,
        street_number: $scope.order.street_number,

        // delivered_on: {
        //   year: new_date.getFullYear(),
        //   month: new_date.getMonth() + 1,
        //   day: new_date.getDate(),
        //   hour: new_date.getHours(),
        //   minute: new_date.getMinutes()
        // },

        recurrencePattern: scheduler.recurrencePattern
      };

      $scope.isSubmitting = true;
      OrderService.editOrder({ id: $scope.order.id }, data, fnCallbackEditOrder);
      return false;
    }

    function fnCompleteOrder() {
      //We can't complete already completed order!
      if ($scope.order.status == 10 || $scope.order.status == 5)
        return false;

      var data = {
        // user_id: $scope.order.user_id,
        notes: $scope.order.completion_notes ? $scope.order.completion_notes : '',
        success: $scope.order.complete
      };

      $scope.isSubmitting = true;
      OrderService.completeOrder({ id: $scope.order.id }, data, fnCallbackCompleteOrder);
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

      $http({
        method: 'GET',
        url: appConfig.API_URL + '/users/list_users/' + organization_id,
        params: {
          query_email: $select.search,
          page: $scope.users.page
        }
      }).then(function(response) {
        $scope.users.page++;
        $scope.users.list = $scope.users.list.concat(response.data);
        if (response.data.length < 10)
          $scope.users.hasMore = false;
      }, function(response) {
        if (response.status === 404) {
          $scope.users.hasMore = false;
        }
      })['finally'](function() {
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

    function fnCallbackEditOrder(result) {
      $scope.isSubmitting = false;

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

    function fnCallbackCompleteOrder(result) {
      $scope.isSubmitting = false;

      switch (result.success) {
        case 1:
          toastr.info('Successfully completed the order!');
          break;
        case 0:
          toastr.error(result.message ? result.message : 'Failed to complete the order!');
          break;
        case -1:
          toastr.warning('Failed to send to the Onfleet!');
          break;
      }
    }

    function fnDeleteOrder() {
      $ngBootbox.confirm('Are you sure you want to delete this order?')
        .then(function() {
          OrderService.deleteOrder({ id: $scope.order.id }, fnCallbackDeleteOrder);
        }, function() {

        });
    }

    function fnCallbackDeleteOrder(result) {
      if (result.success) {
        toastr.info('Successfully deleted the order!');
        $state.go('orders.list');
      } else {
        toastr.error(result.message ? result.message : 'Failed to delete the order!');
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

    function fnInitGoogleMap() {
      if (!$scope.order)
        return;

      var mapCanvas = document.getElementById('google-maps');

      var center = null;
      if ($scope.order.latlong) {
        var pos = $scope.order.latlong.split(',');
        center = { lat: parseFloat(pos[0]), lng: parseFloat(pos[1]) };
      }

      var mapOptions = {
        center: center ? center : new google.maps.LatLng(44.5403, -78.5463),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(mapCanvas, mapOptions);

      $scope.map = map;

      $scope.infoWindow = new google.maps.InfoWindow({ map: map });
      $scope.infoWindow.close();

      if (!center && navigator.geolocation) {
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
      $scope.prices.selected = null;
      $scope.delivery_windows.selected = null;

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

        if ($scope.order.to_deliver_on)
          $scope.delivery_windows.selected = lodash.find($scope.delivery_windows.list, { key: $scope.order.to_deliver_on });
      } else {
        $scope.delivery_windows.list = [];
        $scope.prices.list = [];
      }
    }

    function fnIsOrderPending() {
      return $scope.order.status != 10 && $scope.order.status !=5;
    }
  }
})();