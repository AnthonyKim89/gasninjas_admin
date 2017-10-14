'use strict';

(function() {

  angular.module('GasNinjasAdmin.components.auth')
    .factory('Auth', AuthService);

  function AuthService($location, $http, $cookies, $q, appConfig, Util, UserService) {
    var safeCb = Util.safeCb;
    var currentUser = {};
    // var userRoles = appConfig.userRoles || [];

    if ($cookies.get('token') && $location.path() !== '/logout') {
      currentUser = UserService.getCurrent();
    }

    var Auth = {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      login: function(user, callback) {
        var login_promise = UserService.login({}, {
          email: user.email,
          password: user.password
        }).$promise;

        return login_promise.then(function(response) {
            if (!response.success) {
              throw (response);
            } else if (response && response.data){
              $cookies.put('token', response.data.token);
              currentUser = UserService.getCurrent();
              return currentUser.$promise;
            } else {
              throw ('Unknown Response');
            }
          })
          .then(function(user) {
            var isAllowed = false;

            angular.forEach(user.role, function(role, index) {
              if (appConfig.userRoles.indexOf(role) !== -1)
                isAllowed = true;
            });

            if (isAllowed) {
              safeCb(callback)(null, user);
              return user;
            } else {
              throw({message: 'You are not authorized!'})
            }
          })
          .catch(function(err) {
            Auth.logout();
            safeCb(callback)(err.data ? err.data : err);
            return $q.reject(err.data ? err.data : err);
          });
      },

      /**
       * Delete access token and user info
       */
      logout: function() {
        $cookies.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      createUser: function(user, callback) {
        return User.save(user, function() {
            return safeCb(callback)(null, user);
          }, function(err) {
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      registerUser: function(user, callback) {
        return User.save(user, function(data) {
            $cookies.put('token', data.token);
            currentUser = User.get();
            return safeCb(callback)(null, user);
          }, function(err) {
            Auth.logout();
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional, function(error, user)
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        return User.changePassword({
            id: currentUser._id
          }, {
            oldPassword: oldPassword,
            newPassword: newPassword
          }, function() {
            return safeCb(callback)(null);
          }, function(err) {
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Update user
       *
       * @param  {Object}   user
       * @param  {Function} callback    - optional, function(error, user)
       * @return {Promise}
       */
      updateUser: function(user, callback) {
        return User.updateUser({
            id: user._id
          }, {
            name: user.name,
            email: user.email,
            role: user.role
          }, function() {
            return safeCb(callback)(null);
          }, function(err) {
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Gets all available info on a user
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, funciton(user)
       * @return {Object|Promise}
       */
      getCurrentUser: function(callback) {
        if (arguments.length === 0) {
          return currentUser.data;
        }

        var value = currentUser.hasOwnProperty('$promise') ? currentUser.$promise : currentUser;
        return $q.when(value)
          .then(function(user) {
            safeCb(callback)(user);
            return user;
          }, function() {
            safeCb(callback)({});
            return {};
          });
      },

      /**
       * Check if a user is logged in
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isLoggedIn: function(callback) {
        if (arguments.length === 0) {
          return currentUser.hasOwnProperty('data') && currentUser.data && currentUser.data.id;
        }

        return Auth.getCurrentUser(null)
          .then(function(user) {
            var is = user.hasOwnProperty('data') && user.data && user.data.id;
            safeCb(callback)(is);
            return is;
          });
      },

      /**
       * Check if a user has a specified role or higher
       *   (synchronous|asynchronous)
       *
       * @param  {String}     role     - the role to check against
       * @param  {Function|*} callback - optional, function(has)
       * @return {Bool|Promise}
       */
      hasRole: function(role, callback) {
        var hasRole = function(r, h) {
          return r && r.indexOf(h) !== -1;
        };

        if (arguments.length < 2) {
          return hasRole(currentUser.role, role);
        }

        return Auth.getCurrentUser(null)
          .then(function(user) {
            var has = user.hasOwnProperty('role') ? hasRole(user.role, role) : false;
            safeCb(callback)(has);
            return has;
          });
      },
      /**
       * Check if a user is a driver
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isDriver: function() {
        return Auth.hasRole.apply(Auth, [].concat.apply(['driver'], arguments));
      },

      /**
       * Check if a user is an admin
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isAdmin: function() {
        return Auth.hasRole.apply(Auth, [].concat.apply(['admin'], arguments));
      },

      /**
       * Check if a user is a manager
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isSuperadmin: function() {
        return Auth.hasRole.apply(Auth, [].concat.apply(['superadmin'], arguments));
      },

      /**
       * Get auth token
       *
       * @return {String} - a token string used for authenticating
       */
      getToken: function() {
        return $cookies.get('token');
      }
    };

    return Auth;
  }
})();