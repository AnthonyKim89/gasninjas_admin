/**
 * @author Anthony
 * created on Oct 22, 2017
 */

(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.driver_inspection')
    .factory('InspectionService', InspectionService);

  /** @ngInject */
  function InspectionService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/driver_inspection/:id', {id: '@id'}, {
      getCategoryById: {method: 'GET', url: appConfig.API_URL + '/driver_inspection/get_category_by_id/:id'},
      getFormsByCategoryId: {method: 'GET', url: appConfig.API_URL + '/driver_inspection/get_forms_by_category_id/:id'},
      getQuestionsByFormId: {method: 'GET', url: appConfig.API_URL + '/driver_inspection/get_questions_by_form_id/:id'},
      getQuestionsByCategoryId: {method: 'GET', url: appConfig.API_URL + '/driver_inspection/get_questions_by_category_id/:id'},
      addResponses: {method: 'POST', url: appConfig.API_URL + '/driver_inspection/add_responses'},
      getResponsesByDate: {method: 'GET', url: appConfig.API_URL + '/driver_inspection/get_responses_by_date'},
    });
  }

})();