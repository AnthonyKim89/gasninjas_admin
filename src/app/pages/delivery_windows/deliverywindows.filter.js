/**
 * @author Anthony
 * created on 09/19/2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages.delivery_windows')
    .filter('DeliveryWindowActiveDays', DeliveryWindowActiveDays);

  /** @ngInject */
  function DeliveryWindowActiveDays(DeliveryWindowUtil) {
    return function(input) {
      return DeliveryWindowUtil.convertActiveDaysFromDBStringToUserString(input);
    };
  }

})();