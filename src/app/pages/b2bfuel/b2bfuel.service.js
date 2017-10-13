/**
 * @author Anthony
 * created on Oct 13, 2017
 */

(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.b2bfuel')
    .factory('B2BService', B2BService);

  /** @ngInject */
  function B2BService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/b2b/:id', {id: '@id'}, {
      getAssignmentByDriverId: {method: 'GET', url: appConfig.API_URL + '/b2b/get_assignment'},
      addAssignment: {method: 'POST', url: appConfig.API_URL + '/b2b/add_assignment'},
    });
  }

})();