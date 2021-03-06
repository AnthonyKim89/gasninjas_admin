/**
 * @author Anthony
 * created on 10.11.2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.users')
    .controller('UserRolesListCtrl', UserRolesListCtrl)
    .controller('UserRolesEditCtrl', UserRolesEditCtrl);

  /** @ngInject */
  function UserRolesListCtrl($scope, $state, appConfig) {
    $scope.editRole = fnEditRole;
    $scope.init = fnInit;

    $scope.init();

    function fnInit() {
      $scope.pagination = {
        apiUrl: appConfig.API_URL + '/users/list_roles',
        urlParams: {
          sort: 'id',
          direction: 'asc',
          query_name: '',
        },
        perPage: 10,
        page: 0,
        perPagePresets: [5, 10, 20, 50, 100],
        items: [],
      };
    };

    function fnEditRole(id) {
      $state.go('users.roles-edit', { id: id });
    }
  }

  function UserRolesEditCtrl($scope, $state, $timeout, $stateParams, $q, toastr, lodash, UserService) {
    $scope.initMultiSelect = fnInitMultiSelect;
    $scope.assignUserRoles = fnAssignUserRoles;

    $scope.onDataLoaded = fnOnDataLoaded;

    $scope.role = {};
    $scope.isSubmitting = false;

    $q.all([
      UserService.getRoleInfo({ id: $stateParams.id }).$promise,
      UserService.getAvailableUsers({}, { purpose: 'role', id: $stateParams.id }).$promise
    ]).then($scope.onDataLoaded);

    function fnOnDataLoaded(data) {
      $scope.available_users = data[1];

      if (data[0] && data[0].role) {
        $scope.role = {
          id: data[0].role.id,
          name: data[0].role.name,
          description: data[0].role.description,
          users: data[0].role.users
        }

        $scope.initMultiSelect();
      } else {
        toastr.error('Failed to load the Role Info from the API Server');
        $state.go('users.roles-list');
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

    function fnAssignUserRoles() {
      var assigned_users = [];
      $("#multiselect_to_1 option").each(function() {
        assigned_users.push($(this).val());
      });

      var data = {
        assigned_users: lodash.join(assigned_users, ',')
      };

      $scope.isSubmitting = true;
      UserService.assignUserRoles({ id: $scope.role.id }, data, fnCallback);

      return false;
    }

    function fnCallback(result) {
      $scope.isSubmitting = false;

      switch (result.success) {
        case 1:
          toastr.info('Successfully updated the user roles!');
          $state.go('users.roles-list');
          break;
        case 0:
          toastr.error('Failed to update the user roles!');
          break;
        default:
          toastr.error(result.message ? result.message : 'Unknown Server Error');
          break;
      }
    }
  }

})();