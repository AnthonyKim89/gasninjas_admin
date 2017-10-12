/**
 * @author Anthony
 * created on 10.06.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings')
    .controller('SettingsNotificationCtrl', SettingsNotificationCtrl)
    .controller('AppVersionCtrl', AppVersionCtrl);

  /** @ngInject */
  function SettingsNotificationCtrl($scope, $state, $http, $ngBootbox, toastr, appConfig) {
    $scope.pushNotification = fnPushNotification;

    $scope.notification = {
      message: ''
    };
    $scope.isSending = false;

    function fnPushNotification() {
      $ngBootbox.confirm('Are you sure you want to push notifications to all users?')
        .then(function() {
          $scope.isSending = true;

          $http({
            method: 'POST',
            url: appConfig.API_URL + '/notification/send',
            data: {
              title: $scope.notification.title,
              message: $scope.notification.message
            }
          }).then(function(response) {
            toastr.info('Successfully sent notifications!');
          }, function(response) {
            toastr.error('Failed to send notifications!');
          })['finally'](function() {
            $scope.isSending = false;
          });
        }, function() {

        });
    }
  }

  function AppVersionCtrl($scope, $state, $http, $ngBootbox, toastr, appConfig, VersionService) {
    $scope.updateAppVersion = fnUpdateAppVersion;

    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.version_info = {
      ios: {
        device: 'ios',
      },
      android: {
        device: 'android'
      }
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
      }
    }
  }
})();