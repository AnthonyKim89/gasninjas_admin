'use strict';

(function() {

  angular.module('GasNinjasAdmin.components.auth')
    .run(function($rootScope, $state, $location, Auth) {
      if ($location.absUrl().indexOf('auth.html') != -1 || $location.absUrl().indexOf('reg.html') != -1)
        return;
      // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
      $rootScope.$on('$stateChangeStart', function(event, next) {
        if (!next.authenticate) {
          return;
        }

        if (typeof next.authenticate === 'string') {
          Auth.hasRole(next.authenticate, _.noop)
            .then(function(has) {
              if (has) {
                return;
              }

              event.preventDefault();
              return Auth.isLoggedIn(_.noop)
                .then(function(is) {
                  if (is) {
                    $state.go('dashboard');
                  }else {
                    location.href = 'auth.html';
                  }
                });
            });
        } else {
          Auth.isLoggedIn(_.noop)
            .then(function(is) {
              if (is) {
                return;
              }

              event.preventDefault();
              location.href = 'auth.html';
            });
        }
      });
    });
})();
