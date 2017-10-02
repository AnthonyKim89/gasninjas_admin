/**
 * @author Anthony
 * created on 02/09/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.models')
    .factory('ExampleService', ExampleService);

  /** @ngInject */
  function ExampleService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/examples/:id', {id: '@id'}, {
    	getExampleList: {method: 'GET', isArray: true, url: appConfig.API_URL + '/examples/list_examples'}
    });
  }

})();