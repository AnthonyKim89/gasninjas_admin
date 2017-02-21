/**
 * @author Anthony
 * created on 02.09.2016
 */
(function() {
    'use strict';
    angular.module('GasNinjasAdmin.pages.organizations')
        .controller('OrganizationNewCtrl', OrganizationNewCtrl)
    
    /** @ngInject */
    function OrganizationNewCtrl($scope, $state, toastr, lodash, OrganizationService, DeliveryWindowService) {
        $scope.organization = {};
        $scope.addOrganization = fnAddOrganization;

        $scope.delivery_windows = {
            list: DeliveryWindowService.getDeliveryWindowList(),
            page: 1,
            selected: null,
            loading: false,
        };

        function fnAddOrganization(){
            if (!$scope.delivery_windows.selected){
                toastr.error('Please select the delivery window!');
                return false;
            }

            var data = {
                name: $scope.organization.name,
                margin: $scope.organization.margin,
                textToConfirm: $scope.organization.textToConfirm,
                delivery_windows: {
                    '_ids': lodash.map($scope.delivery_windows.selected, 'id')
                }
            };

            OrganizationService.addOrganization(data, fnCallbackAddNew);

            return false;
        }

        function fnCallbackAddNew(result){
            switch (result.success) {
                case 1:
                    toastr.info('Successfully added a new organization!');
                    $state.go('organizations.list');
                    break;
                case 0:
                    toastr.error('Failed to add a new organization!');
                    break;
                default:
                    toastr.error(result.message ? result.message : 'Unknown Server Error');
                    break;
            }
        }
    }

})();