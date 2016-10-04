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

    $scope.user = {};

    function fnLogin(form) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function(){
        location.href = 'index.html';
      }).catch(function(error){
        console.error(error);
      });
      return false;
    }
  }
})();