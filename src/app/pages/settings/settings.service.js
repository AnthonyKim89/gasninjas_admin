/**
 * @author Anthony
 * created on 10/06/2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages.settings')
    .factory('VersionService', VersionService)
    .factory('ZipcodeService', ZipcodeService);

  /** @ngInject */
  function VersionService($resource, appConfig) {
    return $resource(appConfig.SERVER_URL + '/version/:device', { device: '@device' }, {
      getVersionInfo: { method: 'GET', url: appConfig.SERVER_URL + '/version' },
      updateVersionInfo: { method: 'POST', url: appConfig.API_URL + '/versions/update' },
    });
  }

  function ZipcodeService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/zipcodes', { }, {
      getZipcodeList: { method: 'GET', isArray: true, url: appConfig.API_URL + '/zipcodes/list_zipcodes' },
      updateZipcodeArea: { method: 'POST', url: appConfig.API_URL + '/zipcodes/update' },
    });
  }

})();