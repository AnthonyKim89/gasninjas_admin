/**
 * @author Anthony
 * created on 06/08/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.orders')
    .factory('OrderService', OrderService);

  /** @ngInject */
  function OrderService($resource, SERVER_URL) {
    return $resource(SERVER_URL + '/api/refills/:id', {id: '@id'}, {
    	addNewOrder: {method: 'POST', url: SERVER_URL + '/api/refills/add_order'},
    	addNewOrderWithOnfleet: {method: 'POST', url: SERVER_URL + '/api/refills/add_order/onfleet'},
    	editOrder: {method: 'PUT', url: SERVER_URL + '/api/refills/edit_order/:id'},
    	getDeliveryWindows: {method: 'GET', isArray: true, url: SERVER_URL + '/api/refills/get_delivery_windows'},
      deleteOrder: {method: 'POST', url: SERVER_URL + '/api/refills/delete_order/:id'},
    });
  }

})();