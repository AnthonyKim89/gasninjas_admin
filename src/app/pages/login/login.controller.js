/**
 * @author Anthony
 * created on 19.08.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.login')
        .controller('LoginCtrl', LoginCtrl);

    /** @ngInject */
    function LoginCtrl($scope, $state, Auth) {
        $scope.login = fnLogin;
        
        function fnLogin(form){

        }
    }
})();
