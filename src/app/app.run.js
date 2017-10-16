/**
 * @author Anthony
 * created on the Oct 12, 2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin')
    .run(appRun);

  /** @ngInject */
  function appRun($rootScope, $q, $timeout, $location, $state, Auth) {
    var whatToWait = [];

    if ($location.absUrl().indexOf('auth.html') == -1) {
      whatToWait.push(Auth.isLoggedIn(_.noop));
      $q.all(whatToWait).then(function() {
        if (Auth.isLoggedIn()) {
          $rootScope.$appFinishedLoading = true;
          $rootScope.$currentUser = Auth.getCurrentUser();

          if (!$location.url()) {
            $state.go('dashboard');
          }
        } else
          location.href = 'auth.html';
      });
    }
  }

})();