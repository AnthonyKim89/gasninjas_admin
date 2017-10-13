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
  function SettingsNotificationCtrl($scope, $state, $timeout, $q, $http, $ngBootbox, toastr, lodash, UserService, appConfig) {
    $scope.pushNotification = fnPushNotification;

    $scope.initMultiSelect = fnInitMultiSelect;
    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.notification = {
      message: ''
    };
    $scope.role = {
      id: 1,
      users: []
    }

    $scope.isSending = false;

    $q.all([
      UserService.getRoleInfo({ id: $scope.role.id }).$promise,
      UserService.getAvailableUsers({}, { purpose: 'role', id: $scope.role.id }).$promise
    ]).then($scope.onDataLoaded);

    function fnPushNotification() {
      var assigned_users = [];
      $("#multiselect_to_1 option").each(function() {
        assigned_users.push($(this).val());
      });

      if (!assigned_users || !assigned_users.length) {
        toastr.error('You need to select the users to be notified!');
      } else {
        $ngBootbox.confirm('Are you sure you want to push notifications to assigned users?')
          .then(function() {
            $scope.isSending = true;

            var data = {
              title: $scope.notification.title,
              message: $scope.notification.message,
              assigned_users: lodash.join(assigned_users, ',')
            };

            $http({
              method: 'POST',
              url: appConfig.API_URL + '/notification/send',
              data: data
            }).then(function(response) {
              toastr.info('Successfully sent notifications!');
            }, function(response) {
              toastr.error('Failed to send notifications!');
            })['finally'](function() {
              $scope.isSending = false;
            });
          });
      }
    }

    function fnOnDataLoaded(data) {
      $scope.available_users = data[1];
      $scope.initMultiSelect();
    }

    function fnInitMultiSelect() {
      var elements = $('.multiselect');

      if (elements.length) {
        $('.multiselect').multiselect({
          search: {
            left: '<input type="text" name="q" class="form-control" placeholder="Search..." />',
            right: '<input type="text" name="q" class="form-control" placeholder="Search..." />'
          }
        });
      } else {
        $timeout(fnInitMultiSelect, 500);
      }
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