/**
 * @author Anthony
 * created on 02/09/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.organizations')
    .factory('OrganizationService', OrganizationService);

  /** @ngInject */
  function OrganizationService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/organizations/:id', {id: '@id'}, {
    	getOrganizationList: {method: 'GET', url: SERVER_URL + '/api/organizations/list_organizations/all'},
      getOrganizationInfo: {method: 'GET', url: SERVER_URL + '/api/organizations/get_info/:id'},
      deleteOrganization: {method: 'POST', url: SERVER_URL + '/api/organizations/delete_organization/:id'},
      addOrganization: {method: 'POST', url: SERVER_URL + '/api/organizations/add'},
      editOrganization: {method: 'POST', url: SERVER_URL + '/api/organizations/edit/:id'},
      completeOrganization: {method: 'POST', url: SERVER_URL + '/api/organizations/complete/:id'}
    });
  }

})();