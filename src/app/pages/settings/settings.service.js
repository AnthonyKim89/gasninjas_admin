/**
 * @author Anthony
 * created on 10/06/2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages.settings')
    .factory('VersionService', VersionService);

  /** @ngInject */
  function VersionService($resource, appConfig) {
    return $resource(appConfig.SERVER_URL + '/version/:device', { device: '@device' }, {
      getVersionInfo: { method: 'GET', url: appConfig.SERVER_URL + '/version' },
      updateVersionInfo: { method: 'POST', url: appConfig.API_URL + '/versions/update' },
    });
  }

})();