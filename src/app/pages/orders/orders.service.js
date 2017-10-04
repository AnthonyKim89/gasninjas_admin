/**
 * @author Anthony
 * created on 06/08/2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.pages.orders')
    .factory('OrderService', OrderService);

  /** @ngInject */
  function OrderService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/refills/:id', {id: '@id', zip: '@zip', skip_onfleet: '@skip_onfleet'}, {
    	addNewOrder: {method: 'POST', url: appConfig.API_URL + '/refills/add/:skip_onfleet'},
      getOrderInfo: {method: 'GET', url: appConfig.API_URL + '/refills/get_info/:id'},
    	editOrder: {method: 'PUT', url: appConfig.API_URL + '/refills/edit_order/:id'},
      completeOrder: {method: 'PUT', url: appConfig.API_URL + '/refills/complete_order/:id'},
      deleteOrder: {method: 'POST', url: appConfig.API_URL + '/refills/delete_order/:id'},
      getPrices: {method: 'POST', url: appConfig.API_URL + '/prices/find_new/:zip'},
      deleteSchedule: {method: 'POST', url: appConfig.API_URL + '/refills/delete_schedule/:id'},
    });
  }

})();