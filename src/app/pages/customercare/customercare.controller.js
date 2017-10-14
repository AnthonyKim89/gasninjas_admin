/**
 * @author Anthony
 * created on 10.06.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.settings')
    .controller('PushNotificationCtrl', PushNotificationCtrl)
    .controller('AddBalanceCtrl', AddBalanceCtrl);

  /** @ngInject */
  function PushNotificationCtrl($scope, $state, $timeout, $q, $http, $ngBootbox, toastr, lodash, UserService, appConfig) {
    $scope.pushNotification = fnPushNotification;

    $scope.initMultiSelect = fnInitMultiSelect;
    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.notification = {
      title: '',
      message: ''
    };

    $scope.isSending = false;

    UserService.getAvailableUsers({}).$promise.then($scope.onDataLoaded);

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
      $scope.available_users = data;
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

  function AddBalanceCtrl($scope, $state, $timeout, $q, $http, $ngBootbox, toastr, lodash, UserService, appConfig) {
    $scope.submit = fnSubmit;

    $scope.initMultiSelect = fnInitMultiSelect;
    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.credit = {
      amount: 0,
      reason: ''
    };

    $scope.isSending = false;

    UserService.getAvailableUsers({}).$promise.then($scope.onDataLoaded);

    function fnSubmit() {
      var assigned_users = [];
      $("#multiselect_to_1 option").each(function() {
        assigned_users.push($(this).val());
      });

      if (!assigned_users || !assigned_users.length) {
        toastr.error('You need to select the users to be credited!');
      } else if (!$scope.credit.amount) {
        toastr.error('Please enter the amount to give credits.');
      } else {
        $ngBootbox.confirm('Are you sure you want to give credits to the selected users?')
          .then(function() {
            $scope.isSending = true;

            var data = {
              amount: $scope.credit.amount,
              reason: $scope.credit.reason,
              assigned_users: lodash.join(assigned_users, ',')
            };

            UserService.giveCredits({}, data).$promise
              .then(function(response) {
                $scope.isSending = false;
                if (response.success) {
                  toastr.info('Successfully added credits!');
                  $state.go('users.list');
                } else {
                  toastr.error('Failed to add credits!');
                }
              }).catch(function() {
                $scope.isSending = false;
                toastr.error('Failed to add credits!');
              });

          });
      }
    }

    function fnOnDataLoaded(data) {
      $scope.available_users = data;
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