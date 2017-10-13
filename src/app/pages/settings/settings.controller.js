/**
 * @author Anthony
 * created on 10.06.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings')
    .controller('AppVersionCtrl', AppVersionCtrl);

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
})();