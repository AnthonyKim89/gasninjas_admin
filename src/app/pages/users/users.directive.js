/**
 * @author Anthony
 * created on the Oct 12, 2017
 */

(function() {
  'use strict';

  /**
   * Includes basic panel layout inside of current element.
   */
  angular.module('GasNinjasAdmin.pages.users')
    .directive('userRole', userRole);

  /** @ngInject */
  function userRole() {
    return {
      restrict: 'EA',
      scope: {
        "value": "=",
      },
      templateUrl: "app/pages/users/widgets/directive-userrole.html",
      controller: function($scope) {
        $scope.arr_usertype_styles = {
          'B2B': 'btn-warning',
          'driver': 'btn-info',
          'admin': 'btn-primary',
          'superadmin': 'btn-danger'
        };

        $scope.click = function() {
          alert("YYYYYYYYYY");
        };

        // angular.forEach($scope.value, function(role, index) {
        //   $scope.resultHTML += "<button class='btn btn-xs btn-noscale " +
        //     arr_usertype_styles[role.alias] + "' ng-click='click()'>" +
        //     role.alias + "</button>";
        // });
      },
    };
  }
})();