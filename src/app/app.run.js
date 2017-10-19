/**
 * @author Anthony
 * created on the Oct 12, 2017
 */
(function() {
  'use strict';

  $.fn.numpad.defaults.gridTpl = '<div class="modal-content numpad"></div>';
  $.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
  $.fn.numpad.defaults.buttonNumberTpl = '<button type="button" class="btn btn-default"></button>';
  $.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn" style="width: 100%;"></button>';
  $.fn.numpad.defaults.onKeypadCreate = function() { $(this).find('.done').addClass('btn-primary'); };

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
        } else {
          location.href = 'auth.html#' + $location.url();
        }
      });
    }
  }

})();