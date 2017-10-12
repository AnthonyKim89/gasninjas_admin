/**
 * @author Anthony
 * created on 02.09.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.organizations')
    .controller('OrganizationListCtrl', OrganizationListCtrl);

  /** @ngInject */
  function OrganizationListCtrl($scope, $state, $ngBootbox, toastr, lodash, appConfig, OrganizationService) {
    $scope.addOrganization = fnAddOrganization;
    $scope.editOrganization = fnEditOrganization;
    $scope.deleteOrganization = fnDeleteOrganization;
    $scope.getDeliveryWindows = fnGetDeliveryWindows;

    $scope.init = function() {
      $scope.pagination = {
        apiUrl: appConfig.API_URL + '/organizations/list_organizations',
        urlParams: {
          sort: 'id',
          direction: 'asc',
          query: ''
        },
        perPage: 10,
        page: 0,
        perPagePresets: [5, 10, 20, 50, 100],
        items: [],
      };
    };

    $scope.init();

    function fnAddOrganization(id) {
      $state.go('organizations.new');
    }

    function fnEditOrganization(id) {
      $state.go('organizations.edit', { id: id });
    }

    function fnDeleteOrganization(id) {
      $ngBootbox.confirm('Are you sure you want to delete this organization?')
        .then(function() {
          OrganizationService.deleteOrganization({ id: id }, fnCallbackDeleteOrganization);
        }, function() {

        });
    }

    function fnGetDeliveryWindows(delivery_windows) {
      //return lodash.join(lodash.map(delivery_windows, 'text'), "\n");
      return lodash.map(delivery_windows, 'text');
    }

    function fnCallbackDeleteOrganization(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully deleted the organization!');
          $state.go('organizations.list', {}, { reload: true });
          break;
        case 0:
          toastr.error('Failed to delete the organization!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }

})();