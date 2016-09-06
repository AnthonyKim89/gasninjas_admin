/**
 * @author Anthony
 * created on 02/09/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.models')
    .factory('DeliveryWindowService', DeliveryWindowService);

  /** @ngInject */
  function DeliveryWindowService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/delivery_windows/:id', {id: '@id'}, {
    	getDeliveryWindowList: {method: 'GET', isArray: true, url: SERVER_URL + '/api/delivery_windows/list_delivery_windows'}
    });
  }

})();