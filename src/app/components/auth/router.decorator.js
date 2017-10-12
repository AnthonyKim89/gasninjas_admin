'use strict';

(function() {

  angular.module('GasNinjasAdmin.components.auth')
    .run(function($rootScope, $state, $location, Auth) {
      if ($location.absUrl().indexOf('auth.html') != -1 || $location.absUrl().indexOf('reg.html') != -1)
        return;
      
      // Commented out by Anthony on the Oct 12, 2017
      // This is no longer required because we generate state dynamically based on the user permission
      
      // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
      /*$rootScope.$on('$stateChangeStart', function(event, next) {
        if (!next.authenticate) {
          return;
        }

        if (typeof next.authenticate === 'string') {
          Auth.isLoggedIn(_.noop)
            .then(function(is) {
              if (is) {
                Auth.hasRole(next.authenticate, _.noop)
                  .then(function(has) {
                    if (has) {
                      return;
                    }

                    event.preventDefault();
                    $state.go('dashboard');
                  });
              } else {
                fnForceLogin(event);
              }
            });

        } else {
          Auth.isLoggedIn(_.noop)
            .then(function(is) {
              if (is) {
                return;
              } else {
                fnForceLogin(event);
              }
            });
        }
      });

      function fnForceLogin(event) {
        event.preventDefault();
        location.href = 'auth.html';
      }*/
    });
})();