/**
 * @author Anthony
 * created on 10.06.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings')
    .controller('PushNotificationCtrl', PushNotificationCtrl);

  /** @ngInject */
  function PushNotificationCtrl($scope, $state, $timeout, $q, $http, $ngBootbox, toastr, lodash, UserService, appConfig) {
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
})();