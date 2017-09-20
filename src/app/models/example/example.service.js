/**
 * @author Anthony
 * created on 02/09/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.models')
    .factory('ExampleService', ExampleService);

  /** @ngInject */
  function ExampleService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/examples/:id', {id: '@id'}, {
    	getExampleList: {method: 'GET', isArray: true, url: SERVER_URL + '/api/examples/list_examples'}
    });
  }

})();