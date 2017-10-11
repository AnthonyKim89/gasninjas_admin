/**
 * @author Anthony
 * created on 19.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.login')
    .controller('LoginCtrl', LoginCtrl);

  /** @ngInject */
  function LoginCtrl($scope, $state, toastr, Auth) {
    $scope.login = fnLogin;

    $scope.user = {};

    function fnLogin(form) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function(){
        location.href = 'index.html';
      }).catch(function(error){
        console.error('Failed to log in', error);
        if (error && error.message) {
          toastr.error(error.message);
        } else {
          toastr.error('Failed to log in.');
        }
      });
      return false;
    }
  }
})();
