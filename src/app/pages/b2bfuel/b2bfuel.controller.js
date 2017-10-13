/**
 * @author Anthony
 * created on Oct 12, 2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.b2bfuel')
    .controller('B2BNewLocationCtrl', B2BNewLocationCtrl)
    .controller('B2BDataEntryCtrl', B2BDataEntryCtrl)
    .controller('B2BDataReviewCtrl', B2BDataReviewCtrl);

  /** @ngInject */
  function B2BDataEntryCtrl($scope, $state, $ngBootbox, $timeout, toastr, lodash, B2BService, UserService, Auth) {
    $scope.onAssignmentLoaded = fnOnAssignmentLoaded;
    $scope.submit = fnSubmit;
    $scope.getVehiclesUnfilled = fnGetVehiclesUnfilled;
    $scope.onB2BRefillsChanged = fnOnB2bRefillsChanged;
    $scope.fetchDrivers = fnFetchDrivers;

    $scope.isAdmin = Auth.isAdmin() || Auth.isSuperadmin();

    $scope.drivers = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true,
    };

    $scope.b2b_customer = {};
    $scope.b2b_vehicles = [];
    $scope.b2b_vehicles_unfilled = []
    $scope.isSumitting = false;

    if ($scope.isAdmin) {
      $scope.fetchDrivers();

      $scope.$watch('drivers.selected', function(newVal, oldVal) {
        if (newVal === oldVal) return;

        B2BService.getAssignmentByDriverId({
          driver_id: $scope.drivers.selected.id
        }).$promise.then($scope.onAssignmentLoaded).catch($scope.onAssignmentLoaded);
      });
    } else {
      B2BService.getAssignmentByDriverId({
        driver_id: Auth.getCurrentUser().data.id
      }).$promise.then($scope.onAssignmentLoaded).catch($scope.onAssignmentLoaded);
    }

    $scope.$watch('b2b_refills', $scope.onB2BRefillsChanged, true);

    function fnOnB2bRefillsChanged(newVal, oldVal) {
      if (newVal == oldVal) return;

      var bHasUnfilledRow = false;
      angular.forEach(newVal, function(item, index) {
        if (!item.selected)
          bHasUnfilledRow = true;
      });

      if (!bHasUnfilledRow) {
        newVal.push({
          selected: null,
          gallon: '',
          gas_type: 87
        });
      }
    }

    function fnGetVehiclesUnfilled($selected) {
      var selected_vehicle_tag = $selected && $selected.tag ? $selected.tag : '';

      var b2b_vehicles_unfilled = $scope.b2b_vehicles.filter(function(vehicle) {
        var refill = $scope.b2b_refills.find(function(item) {
          return item.selected && item.selected.tag == vehicle.tag && item.selected.tag != selected_vehicle_tag;
        });
        return refill ? false : true;
      });

      return b2b_vehicles_unfilled
    }

    function fnOnAssignmentLoaded(data) {
      if (!data.success) {
        toastr.error('You need to enter the B2B customer info first.');
        $state.go('b2bfuel.new-location');
      } else {
        $scope.b2b_data = data.data;
        console.log($scope.b2b_data);
        $scope.b2b_vehicles = data.vehicles;

        $scope.b2b_vehicles.push({
          tag: '',
        });

        $scope.b2b_refills = [{
          selected: null,
          gallon: '',
          gas_type: 87
        }];
      }
    }

    function fnFetchDrivers($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.drivers.page = 1;
        $scope.drivers.list = [];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.drivers.loading = true;

      UserService.getUserList({
        role: 'driver',
        query_fullname: $select ? $select.search : '',
        page: $scope.drivers.page,
        limit: 10
      }).$promise.then(function(response) {
        $scope.drivers.page++;
        $scope.drivers.list = $scope.drivers.list.concat(response);
        if (response.length < 10)
          $scope.drivers.hasMore = false;
        else
          $scope.drivers.hasMore = true;
        $scope.drivers.loading = false;
      }).catch(function(response) {
        $scope.drivers.hasMore = false;
        $scope.drivers.loading = false;
      });
    }

    function fnSubmit() {
      $scope.isSumitting = true;

    }
  }

  function B2BNewLocationCtrl($scope, $state, $ngBootbox, $timeout, $q, toastr, lodash, UserService, B2BService, DeliveryWindowService, Auth) {
    $scope.isAdmin = Auth.isAdmin() || Auth.isSuperadmin();

    $scope.drivers = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true,
    };
    $scope.b2b_customers = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true,
    };

    $scope.delivery_windows = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
    };

    $scope.b2b_assignment = {
      parking_address: '',
      lat: 0,
      lng: 0,
    };

    $scope.isSumitting = false;

    $scope.init = fnInit;
    $scope.fetchDrivers = fnFetchDrivers;
    $scope.fetchB2BCustomers = fnFetchB2BCustomers;
    $scope.onDataLoaded = fnOnDataLoaded;
    $scope.onDataLoadingFailed = fnOnDataLoadingFailed;
    $scope.initGoogleMap = fnInitGoogleMap;
    $scope.centerChanged = fnHandlerOnCenterChanged;
    $scope.placeChanged = fnHandlerOnPlaceChanged;
    $scope.addB2bAssignment = fnAddNew;

    $scope.init();

    function fnInit() {
      var whatToWait = [
        UserService.getUserList({ role: 'b2b', page: $scope.b2b_customers.page, limit: 10 }).$promise,
        DeliveryWindowService.getDeliveryWindowList({ is_active: true }).$promise
      ];

      if (Auth.isAdmin() || Auth.isSuperadmin()) {
        whatToWait.push(
          UserService.getUserList({ role: 'driver', page: $scope.b2b_customers.page, limit: 10 }).$promise
        );
      }

      $scope.drivers.loading = true;
      $scope.b2b_customers.loading = true;
      $scope.delivery_windows.loading = true;

      $timeout($scope.initGoogleMap, 100);

      $q.all(whatToWait)
        .then($scope.onDataLoaded)
        .catch($scope.onDataLoadingFailed);
    }

    function fnOnDataLoaded(data) {
      //B2B Customers
      $scope.b2b_customers.page++;
      $scope.b2b_customers.list = data[0];
      $scope.b2b_customers.loading = false;
      if (data[0].length < 10)
        $scope.b2b_customers.hasMore = false;

      $scope.delivery_windows.list = data[1];
      $scope.delivery_windows.loading = false;

      //Drivers
      if (data.length > 2) {
        $scope.drivers.page++;
        $scope.drivers.list = data[2];
        $scope.drivers.loading = false;
        if (data[2].length < 10)
          $scope.drivers.hasMore = false;
      } else {
        $scope.drivers.loading = false;
        $scope.drivers.hasMore = false;
        $scope.drivers.list = [Auth.getCurrentUser().data];
      }

      if (!$scope.drivers.list || !$scope.drivers.list.length) {
        toast.warn('There is no driver available. You need to add drivers first!');
        $state.go('users.roles-list');
      }
    }

    function fnOnDataLoadingFailed() {
      toastr.error('Failed to load data from the server!');
      $scope.b2b_customers.loading = false;
      $scope.b2b_customers.hasMore = false;

      $scope.drivers.loading = false;
      $scope.drivers.hasMore = false;

      if (Auth.isAdmin() || Auth.isSuperadmin())
        $state.go('dashboard');
    }

    function fnFetchDrivers($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.drivers.page = 1;
        $scope.drivers.list = [];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.drivers.loading = true;

      UserService.getUserList({
        role: 'driver',
        query_fullname: $select ? $select.search : '',
        page: $scope.drivers.page,
        limit: 10
      }).$promise.then(function(response) {
        $scope.drivers.page++;
        $scope.drivers.list = $scope.drivers.list.concat(response);
        if (response.length < 10)
          $scope.drivers.hasMore = false;
        else
          $scope.drivers.hasMore = true;
        $scope.drivers.loading = false;
      }).catch(function(response) {
        $scope.drivers.hasMore = false;
        $scope.drivers.loading = false;
      });
    }

    function fnFetchB2BCustomers($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.b2b_customers.page = 1;
        $scope.b2b_customers.list = [];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.b2b_customers.loading = true;

      UserService.getUserList({
        role: 'b2b',
        query_email: $select ? $select.search : '',
        page: $scope.b2b_customers.page,
        limit: 10
      }).$promise.then(function(response) {
        $scope.b2b_customers.page++;
        $scope.b2b_customers.list = $scope.b2b_customers.list.concat(response);
        if (response.length < 10)
          $scope.b2b_customers.hasMore = false;
        else
          $scope.b2b_customers.hasMore = true;
        $scope.b2b_customers.loading = false;
      }).catch(function(response) {
        $scope.b2b_customers.hasMore = false;
        $scope.b2b_customers.loading = false;
      });
    }

    function fnAddNew() {
      if ($scope.drivers.list.length > 1 && !$scope.drivers.selected) {
        alert("Please select a driver.");
        return;
      }

      if (!$scope.b2b_customers.selected) {
        alert("Please select a B2B customer.");
        return;
      }

      if (!$scope.b2b_assignment.parking_address) {
        alert("Please select a location of the B2B customer.");
        return;
      }

      if (!$scope.delivery_windows.selected) {
        alert("Please select a delivery window.");
        return;
      }

      $scope.isSumitting = true;

      $scope.b2b_assignment.driver_id = $scope.drivers.list.length === 1 ? $scope.drivers.list[0].id : $scope.drivers.selected.id;
      $scope.b2b_assignment.user_id = $scope.b2b_customers.selected.id;
      $scope.b2b_assignment.delivery_window_id = $scope.delivery_windows.selected.id;

      B2BService.addAssignment($scope.b2b_assignment, fnCallbackAddNew);
    }

    function fnCallbackAddNew(result) {
      $scope.isSubmitting = false;

      if (result.success) {
        toastr.info('Successfully added a new B2B assignment!');
        $state.go('b2bfuel.data-entry');
      } else {
        toastr.error(result.message ? result.message : 'Failed to add new!');
      }
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

            $scope.b2b_assignment.parking_address = results[0].formatted_address;
            $scope.b2b_assignment.lat = pos.lat();
            $scope.b2b_assignment.lng = pos.lng();

          } else {
            $scope.b2b_assignment.parking_address = '';
            $scope.b2b_assignment.lat = 0;
            $scope.b2b_assignment.lng = 0;
          }
        }
      });
    }
  }

  function B2BDataReviewCtrl($scope, $state, $ngBootbox, $timeout, toastr, lodash, OrderService, Auth) {}

})();