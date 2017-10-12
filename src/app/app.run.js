/**
 * @author Anthony
 * created on the Oct 12, 2017
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin')
    .run(appRun);

  /** @ngInject */
  function appRun($rootScope, $q, $timeout, Auth) {
    var whatToWait = [
      Auth.isLoggedIn(_.noop)
    ];

    $q.all(whatToWait).then(function () {
      $rootScope.$appFinishedLoading = true;
    });
  }

})();