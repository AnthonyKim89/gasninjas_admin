/**
 * @author Anthony
 * created on 06/08/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.users')
    .factory('UserService', UserService);

  /** @ngInject */
  function UserService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/users/:id', {id: '@id'}, {
    	getUserList: {method: 'GET', url: SERVER_URL + '/api/users/list_users/all'},
      getUserInfo: {method: 'GET', url: SERVER_URL + '/api/users/get_info/:id'}
    });
  }

})();