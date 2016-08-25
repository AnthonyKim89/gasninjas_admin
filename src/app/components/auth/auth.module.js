/**
 * @author Anthony
 * created on 19.08.2016
 */
(function () {
  'use strict';

  angular.module('GasNinjasAdmin.components.auth', [
    'ui.router',
    'ngCookies',

    'GasNinjasAdmin.constants',
    'GasNinjasAdmin.components.util',
  ]).config(function($httpProvider){
    $httpProvider.interceptors.push('authInterceptor');
  });

})();
