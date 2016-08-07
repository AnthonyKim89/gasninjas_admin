/**
 * @author a.demeshko
 * created on 3/1/16
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.users')
    .factory('UsersService', UsersService);

  /** @ngInject */
  function UsersService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/users/:id', {id: '@id'}, {
      getUsers: {method: 'GET', url: SERVER_URL + '/api/users/list_users'}
    });
  }

})();