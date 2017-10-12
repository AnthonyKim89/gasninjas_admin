/**
 * @author Anthony
 * created on 02.09.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.organizations')
    .controller('OrganizationEditCtrl', OrganizationEditCtrl);

  /** @ngInject */
  function OrganizationEditCtrl($scope, $state, $ngBootbox, $timeout, $stateParams, $q, toastr, lodash, OrganizationService, DeliveryWindowService, UserService) {
    $scope.editOrganization = fnEditOrganization;
    $scope.completeOrganization = fnCompleteOrganization;
    $scope.deleteOrganization = fnDeleteOrganization;
    $scope.initMultiSelect = fnInitMultiSelect;

    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.delivery_windows = {
      list: DeliveryWindowService.getDeliveryWindowList(),
      page: 1,
      selected: null,
      loading: false,
    };

    $q.all([
      OrganizationService.getOrganizationInfo({ id: $stateParams.id }).$promise,
      UserService.getAvailableUsers({}, { purpose: 'organization' }).$promise
    ]).then($scope.onDataLoaded);

    function fnOnDataLoaded(data) {
      $scope.available_users = data[1];

      if (data[0] && data[0].organization) {
        $scope.organization = {
          id: data[0].organization.id,
          name: data[0].organization.name,
          margin: data[0].organization.margin,
          textToConfirm: data[0].organization.textToConfirm === true || data[0].organization.textToConfirm === '1' ? true : false,
          users: data[0].organization.users
        };

        $scope.delivery_windows.list.$promise.then(function(result) {
          var ids = lodash.map(data[0].organization.delivery_windows, 'id');
          $scope.delivery_windows.selected = [];
          for (var i = 0; i < ids.length; i++) {
            $scope.delivery_windows.selected[i] = lodash.find(result, { id: ids[i] });
          }
        });

        $scope.initMultiSelect();
      } else {
        toastr.error('Failed to load the Organization Info from the API Server');
        $state.go('organizations.list');
      }
    }

    function fnInitMultiSelect() {
      var elements = $('.multiselect');

      if (elements.length) {
        $('.multiselect').multiselect({
          search: {
            left: '<input type="text" name="q" class="form-control" placeholder="Search..." />',
            right: '<input type="text" name="q" class="form-control" placeholder="Search..." />'
          }
        });
      } else {
        $timeout(fnInitMultiSelect, 500);
      }
    }

    function fnEditOrganization() {
      if (!$scope.delivery_windows.selected) {
        toastr.error('Please select the delivery window!');
        return false;
      }

      var data = {
        name: $scope.organization.name,
        margin: $scope.organization.margin,
        textToConfirm: $scope.organization.textToConfirm ? 1 : 0,
        delivery_windows: {
          '_ids': lodash.map($scope.delivery_windows.selected, 'id')
        }
      };

      OrganizationService.editOrganization({ id: $scope.organization.id }, data, fnCallbackEditOrganization);

      return false;
    }

    function fnCompleteOrganization() {
      var assigned_users = [];
      $("#multiselect_to_1 option").each(function() {
        assigned_users.push($(this).val());
      });

      var data = {
        /*users: {
            '_ids': assigned_users
        },*/
        assigned_users: lodash.join(assigned_users, ',')
      };

      OrganizationService.completeOrganization({ id: $scope.organization.id }, data, fnCallbackEditOrganization);

      return false;
    }

    function fnDeleteOrganization() {
      $ngBootbox.confirm('Are you sure you want to delete this organization?')
        .then(function() {
          OrganizationService.deleteOrganization({ id: $scope.organization.id }, fnCallbackDeleteOrganization);
        }, function() {

        });
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

    function fnCallbackEditOrganization(result) {
      switch (result.success) {
        case 1:
          toastr.info('Successfully updated the organization!');
          $state.go('organizations.list');
          break;
        case 0:
          toastr.error('Failed to update the organization!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }
})();