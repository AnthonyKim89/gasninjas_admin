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
    return $resource(SERVER_URL + '/api/refills/:id', {id: '@id', zip: '@zip'}, {
    	addNewOrder: {method: 'POST', url: SERVER_URL + '/api/refills/add_order'},
    	addNewOrderWithOnfleet: {method: 'POST', url: SERVER_URL + '/api/refills/add_order/onfleet'},
      getOrderInfo: {method: 'GET', url: SERVER_URL + '/api/refills/get_info/:id'},
    	editOrder: {method: 'PUT', url: SERVER_URL + '/api/refills/edit_order/:id'},
      completeOrder: {method: 'PUT', url: SERVER_URL + '/api/refills/complete_order/:id'},
      deleteOrder: {method: 'POST', url: SERVER_URL + '/api/refills/delete_order/:id'},
      getPrices: {method: 'POST', url: SERVER_URL + '/api/prices/find_new/:zip'},
      deleteSchedule: {method: 'POST', url: SERVER_URL + '/api/refills/delete_schedule/:id'},
    });
  }

})();