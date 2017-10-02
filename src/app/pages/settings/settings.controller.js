/**
 * @author Anthony
 * created on 09.14.2017
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.settings')
        .controller('SettingsNotificationCtrl', SettingsNotificationCtrl);
    
    /** @ngInject */
    function SettingsNotificationCtrl($scope, $state, $http, $ngBootbox, toastr, appConfig) {
        $scope.pushNotification = fnPushNotification;

        $scope.notification = {
            message: ''
        };
        $scope.isSending = false;

        function fnPushNotification(){
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
})();