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
    	editOrder: {method: 'PUT', url: appConfig.API_URL + '/refills/edit/:id'},
      completeOrder: {method: 'PUT', url: appConfig.API_URL + '/refills/complete/:id'},
      deleteOrder: {method: 'POST', url: appConfig.API_URL + '/refills/delete/:id'},
      getPrices: {method: 'POST', url: appConfig.API_URL + '/prices/find_new/:zip'},
      editSchedule: {method: 'PUT', url: appConfig.API_URL + '/refills/edit_schedule/:id'},
      deleteSchedule: {method: 'POST', url: appConfig.API_URL + '/refills/delete_schedule/:id'},
      registerB2BRefills: {method: 'POST', url: appConfig.API_URL + '/refills/register_b2b_refills'},
    });
  }

})();