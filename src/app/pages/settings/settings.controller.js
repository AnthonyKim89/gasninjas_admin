/**
 * @author Anthony
 * created on 10.06.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings')
    .controller('AppVersionCtrl', AppVersionCtrl)
    .controller('ZipcodeAreaCtrl', ZipcodeAreaCtrl)
    .controller('ZoneListCtrl', ZoneListCtrl)
    .controller('ZoneAddCtrl', ZoneAddCtrl);

  /** @ngInject */
  function AppVersionCtrl($scope, $state, $http, $ngBootbox, toastr, appConfig, VersionService) {
    $scope.updateAppVersion = fnUpdateAppVersion;
    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.version_info = {
      ios: {
        device: 'ios',
      },
      android: {
        device: 'android'
      },
      loaded: false
    };

    $scope.isSubmitting = false;

    VersionService.getVersionInfo().$promise.then($scope.onDataLoaded);

    function fnUpdateAppVersion(device) {
      $scope.isSubmitting = true;
      VersionService.updateVersionInfo({}, $scope.version_info[device], function(result) {
        $scope.isSubmitting = false;

        if (result.success) {
          toastr.info('Successfully updated the version!');
        } else {
          toastr.error('Failed to update the version!');
        }
      });
    }

    function fnOnDataLoaded(data) {
      if (data.success) {
        for (var i = 0; i < data.versions.length; i++) {
          if (data.versions[i].device === 'ios') {
            $scope.version_info.ios = {
              device: data.versions[i].device,
              current_version: data.versions[i].current_version,
              min_version: data.versions[i].min_version,
              force_update: data.versions[i].force_update,
            };
          } else if (data.versions[i].device === 'android') {
            $scope.version_info.android = {
              device: data.versions[i].device,
              current_version: data.versions[i].current_version,
              min_version: data.versions[i].min_version,
              force_update: data.versions[i].force_update,
            };
          }
        }
        $scope.version_info.loaded = true;
      }
    }
  }

  function ZipcodeAreaCtrl($scope, $state, $ngBootbox, $timeout, toastr, lodash, B2BService, UserService, ZipcodeService, Auth) {
    $scope.onDataLoaded = fnOnDataLoaded;
    $scope.getZipcodesUnfilled = fnGetZipcodesUnfilled;
    $scope.onAreaUpdates = fnOnAreaUpdate;
    $scope.fetchZipcodes = fnFetchZipcodes;
    $scope.submit = fnSubmit;
    $scope.init = fnInit;

    $scope.init();

    $scope.$watch('area_updates', $scope.onAreaUpdates, true);

    function fnInit() {
      $scope.isSubmitting = false;

      $scope.zipcodes = {
        list: [],
        page: 1,
        selected: null,
        loading: false,
        hasMore: true,
      };
      $scope.zipcodes_unfilled = []

      ZipcodeService.getZipcodeList().$promise.then($scope.onDataLoaded).catch($scope.onDataLoaded);
    }

    function fnOnAreaUpdate(newVal, oldVal) {
      if (newVal == oldVal) return;

      var bHasUnfilledRow = false;
      angular.forEach(newVal, function(item, index) {
        if (!item.selected)
          bHasUnfilledRow = true;
        else if (item.selected.zipcode)
          item.zipcode = item.selected.zipcode;
      });

      if (!bHasUnfilledRow) {
        newVal.push({
          selected: null,
          polygon: '',
        });
      }
    }

    function fnGetZipcodesUnfilled($selected) {
      var selected_zipcode = $selected && $selected.zipcode ? $selected.zipcode : '';

      var zipcodes_unfilled = $scope.zipcodes.list.filter(function(vehicle) {
        var refill = $scope.area_updates.find(function(item) {
          return item.selected && item.selected.zipcode == vehicle.zipcode && item.selected.zipcode != selected_zipcode;
        });
        return refill ? false : true;
      });

      return zipcodes_unfilled;
    }

    function fnOnDataLoaded(data) {
      if (!Array.isArray(data)) {
        toastr.error('Failed to load the zipcode info.');
        $state.go('dashboard');
      } else {
        $scope.zipcodes.list = data;
        $scope.zipcodes.list.push({
          zipcode: '',
        });

        $scope.area_updates = [{
          selected: null,
          polygon: '',
        }];
      }
    }

    function fnSubmit() {
      $scope.isSubmitting = true;

      ZipcodeService.updateZipcodeArea($scope.area_updates).$promise
        .then(fnSubmitCallback)
        .catch(fnSubmitCallback);
    }

    function fnSubmitCallback(result) {
      if (result.success) {
        toastr.info('Successfully updated Zipcode Areas.');
        $state.go('dashboard');
      } else {
        $scope.isSubmitting = false;
        toastr.error(result.message ? result.message : 'Failed to update Zipcode Areas!');
      }
    }

    function fnFetchZipcodes($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.zipcodes.page = 1;
        $scope.zipcodes.list = [];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.zipcodes.loading = true;

      ZipcodeService.getZipcodeList({
        query_zipcode: $select ? $select.search : '',
        page: $scope.zipcodes.page,
        limit: 10
      }).$promise.then(function(data) {
        $scope.zipcodes.page++;
        $scope.zipcodes.list = $scope.zipcodes.list.concat(data);
        $scope.zipcodes.loading = false;
        if (data.length < 10)
          $scope.zipcodes.hasMore = false;
        else
          $scope.zipcodes.hasMore = true;
      }).catch(function() {
        $scope.zipcodes.hasMore = false;
        $scope.zipcodes.loading = false;
      });
    }
  }

  function ZoneListCtrl($scope, $state, $http, $ngBootbox, toastr, appConfig, ZoneService) {
    $scope.deleteZone = fnDeleteZone;

    $scope.pagination = {
      apiUrl: appConfig.API_URL + '/zones/list_zones',
      urlParams: {
        sort: 'created',
        direction: 'desc',
      },
      perPage: 5,
      page: 0,
      perPagePresets: [5, 10, 20, 50, 100],
      items: [],
    };

    function fnDeleteZone(id) {
      $ngBootbox.confirm('Are you sure you want to delete this zone?')
        .then(function() {
          ZoneService.deleteZone({ id: id }, fnCallbackDeleteZone);
        }, function() {

        });
    }

    function fnCallbackDeleteZone(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully deleted the zone!');
          $state.go('settings.zone-list', {}, { reload: true });
          break;
        case 0:
        default:
          toastr.error(result.message ? result.message : 'Failed to delete the order!');
          break;
      }
    }
  }

  function ZoneAddCtrl($scope, $state, $http, $ngBootbox, $cookies, toastr, appConfig, ZoneService) {
    $scope.submit = fnSubmit;

    $scope.zone = {
      type: true,
      title: ''
    };
    $scope.isSubmitting = false;

    function fnSubmit() {
      $scope.isSubmitting = true;

      // Get form
      var form = $('#zoneForm')[0];

      // Create an FormData object
      var data = new FormData(form);

      // If you want to add an extra field for the FormData
      data.append("type", $scope.zone.type ? 'green' : 'red');
      data.append("title", $scope.zone.title);

      $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: appConfig.API_URL + '/zones/add_zone',
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        beforeSend: function(xhr) {
          /* Authorization header */
          xhr.setRequestHeader("Authorization", 'Bearer ' + $cookies.get('token'));
        },
        success: function(data) {
          $scope.isSubmitting = false;

          if (data.success) {
            toastr.info('Successfully uploaded the zone info.');
            $state.go('settings.zone-list');
          } else {
            console.error(data);
            toastr.error(data.message ? data.message : 'Failed to upload the zone info.');
          }
        },
        error: function(e) {
          $scope.isSubmitting = false;

          console.error('Failed to upload the zone info.', e);
          toastr.error('Failed to upload the zone info.');
        }
      });

      return false;
    }
  }
})();