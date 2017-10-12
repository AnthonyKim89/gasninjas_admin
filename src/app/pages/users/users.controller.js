/**
 * @author Anthony
 * created on 06.08.2016
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.users')
    .controller('UserListCtrl', UserListCtrl)
    .controller('UserEditCtrl', UserEditCtrl);

  /** @ngInject */
  function UserListCtrl($scope, $state, appConfig) {
    $scope.viewUser = fnViewUser;

    $scope.init = function() {
      $scope.pagination = {
        apiUrl: appConfig.API_URL + '/users/list_users',
        urlParams: {
          sort: 'id',
          direction: 'asc',
          query_fullname: '',
          query_email: '',
          query_phone: '',
        },
        perPage: 10,
        page: 0,
        perPagePresets: [5, 10, 20, 50, 100],
        items: [],
      };
    };

    $scope.init();

    function fnViewUser(id) {
      $state.go('users.edit', { id: id });
    }
  }

  function UserEditCtrl($scope, $state, $stateParams, toastr, UserService) {
    $scope.onDataLoaded = fnOnDataLoaded;

    UserService.getUserInfo({
      id: $stateParams.id
    }).$promise.then($scope.onDataLoaded);

    function fnOnDataLoaded(data) {
      if (data && data.user) {
        $scope.personalInfo = {
          fullname: data.user.fullname,
          email: data.user.email,
          phone: data.user.phone,
          device: data.user.device,
        };

        $scope.paymentInfo = {
          payments: data.user.payments,
          smartTablePageSize: 10
        };

        $scope.vehicleInfo = {
          vehicles: data.user.vehicles,
          smartTablePageSize: 10
        };

        $scope.orderInfo = {
          orders: data.user.refills,
          smartTablePageSize: 10
        };
      } else {
        toastr.error('Failed to load the User Info from the API Server');
        $state.go('users.list');
      }
    }

    // function fnLoadUserInfo() {
    //     UserService.getUserInfo({
    //         id: $state.params.id
    //     }).$promise.then(function(data) {
    //         // $timeout(function() {
    //         //     $scope.$apply(function() {
    //         //         $scope.users = data.users;

    //         //         $scope.pagination.prevPage = data.paging.prevPage;
    //         //         $scope.pagination.nextPage = data.paging.nextPage;

    //         //         $scope.paging = data.paging;
    //         //     });
    //         // }, 500);
    //         console.log(data);
    //         vm.personalInfo = {
    //             fullname: data.user.fullname,
    //             email: data.user.email,
    //             phone: data.user.phone,
    //             device: data.user.device,
    //         };
    //         vm.paymentInfo.payments = data.user.payments;
    //         console.log(vm.paymentInfo.payments);
    //     }).catch(function(err) {
    //         console.error('Failed to Load User Info from the API Server', err);
    //     });
    // }
  }
})();