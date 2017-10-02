/**
 * @author Anthony
 * created on 09/19/2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages.delivery_windows')
    .factory('DeliveryWindowService', DeliveryWindowService)
    .factory('DeliveryWindowUtil', DeliveryWindowUtil);

  /** @ngInject */
  function DeliveryWindowService($resource, appConfig) {
    return $resource(appConfig.API_URL + '/delivery_windows/:id', { id: '@id' }, {
      getDeliveryWindowList: { method: 'GET', isArray: true, url: appConfig.API_URL + '/delivery_windows/list_delivery_windows' },
      getDeliveryWindowInfo: { method: 'GET', url: appConfig.API_URL + '/delivery_windows/get_info/:id' },
      deleteDeliveryWindow: { method: 'POST', url: appConfig.API_URL + '/delivery_windows/delete_delivery_window/:id' },
      addDeliveryWindow: { method: 'POST', url: appConfig.API_URL + '/delivery_windows/add' },
      editDeliveryWindow: { method: 'POST', url: appConfig.API_URL + '/delivery_windows/edit/:id' },
    });
  }

  function DeliveryWindowUtil() {
    var strFormat = 'SMTWTFS';

    return {
      convertActiveDaysFromDBStringToArray: function(strActiveDays) {
        var result = [];

        for (var i = 0; i < 7; i++) {
          if (strActiveDays && strActiveDays.length > i && strActiveDays.substr(i, 1))
            result[i] = true;
          else
            result[i] = false;
        }

        return result;
      },
      convertActiveDaysFromDBStringToUserString: function(strActiveDays) {
        var result = '';

        for (var i = 0; i < 7; i++) {
          if (strActiveDays && strActiveDays.length > i && strActiveDays.substr(i, 1) === "1")
            result += strFormat.substr(i, 1);
          else
            result += 'X';
        }

        return result;
      },
      convertActiveDaysFromArrayToDBString: function(arrActiveDays) {
        var result = '';
        console.log(arrActiveDays);

        for (var i = 0; i < 7; i++) {
          if (arrActiveDays && arrActiveDays[i])
            result += '1';
          else
            result += '0';
        }

        return result;
      },
      convertActiveDaysFromArrayToUserString: function(arrActiveDays) {
        var result = '';

        for (var i = 0; i < 7; i++) {
          if (arrActiveDays && arrActiveDays[i])
            result += strFormat.substr(i, 1);
          else
            result += 'X';
        }

        return result;
      }
    }
  }

})();