/**
 * @author Anthony
 * created on 06/08/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.users')
    .factory('UserService', UserService);

  /** @ngInject */
  function UserService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/users/:id', {id: '@id'}, {
    	getUserList: {method: 'GET', url: appConfig.API_URL + '/users/list_users/all'},
      getUserInfo: {method: 'GET', url: appConfig.API_URL + '/users/get_info/:id'},
      getAvailableUsers: {method: 'GET', isArray:true, url: appConfig.API_URL + '/users/list_available_users'},
    });
  }

})();