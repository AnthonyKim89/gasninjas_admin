/**
 * @author Anthony
 * created on 02/09/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.organizations')
    .factory('OrganizationService', OrganizationService);

  /** @ngInject */
  function OrganizationService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/organizations/:id', {id: '@id'}, {
    	getOrganizationList: {method: 'GET', url: appConfig.API_URL + '/organizations/list_organizations/all'},
      getOrganizationInfo: {method: 'GET', url: appConfig.API_URL + '/organizations/get_info/:id'},
      deleteOrganization: {method: 'POST', url: appConfig.API_URL + '/organizations/delete_organization/:id'},
      addOrganization: {method: 'POST', url: appConfig.API_URL + '/organizations/add'},
      editOrganization: {method: 'POST', url: appConfig.API_URL + '/organizations/edit/:id'},
      completeOrganization: {method: 'POST', url: appConfig.API_URL + '/organizations/complete/:id'}
    });
  }

})();