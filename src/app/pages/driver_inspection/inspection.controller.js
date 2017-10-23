/**
 * @author Anthony
 * created on Oct 22, 2017
 */
(function() {
  'use strict';
  angular.module('GasNinjasAdmin.pages.driver_inspection')
    .controller('InspectionResponseCtrl', InspectionResponseCtrl);

  /** @ngInject */
  function InspectionResponseCtrl($scope, $state, $stateParams, $ngBootbox, $timeout, $q, toastr, lodash, UserService, InspectionService, Auth) {
    $scope.onDataLoaded = fnOnDataLoaded;
    $scope.onDataLoadFailed = fnOnDataLoadFailed;
    $scope.getQuestions = fnGetQuestionsByformId;
    $scope.next = fnNext;
    $scope.previous = fnPrevious;
    $scope.onDataSubmitted = fnOnDataSubmitted;
    $scope.onDataSubmitFailed = fnOnDataSubmitFailed;

    var category_id = $stateParams.category_id;

    $scope.inspection_category = {};
    $scope.inspection_forms = [];
    $scope.inspection_questions = {};
    $scope.inspection_responses = {};
    $scope.isDataLoaded = false;
    $scope.isSubmitting = false;
    $scope.force_update = false;

    $scope.driver_name = Auth.getCurrentUser().fullname;
    $scope.now = new Date();

    $q.all([
      InspectionService.getCategoryById({ id: category_id }).$promise,
      InspectionService.getFormsByCategoryId({ id: category_id }).$promise,
      InspectionService.getQuestionsByCategoryId({ id: category_id }).$promise,
      InspectionService.getResponsesByDate({ driver_id: Auth.getCurrentUser().id, category_id: category_id }).$promise
    ]).then($scope.onDataLoaded).catch($scope.onDataLoadFailed);

    function fnOnDataLoaded(result) {
      $scope.inspection_category = result[0].data;
      $scope.inspection_forms = result[1].data;

      angular.forEach(result[2].data, function(question, index) {
        if (!Array.isArray($scope.inspection_questions[question.form_id])) {
          $scope.inspection_questions[question.form_id] = [];
          $scope.inspection_responses[question.form_id] = {};
        }
        $scope.inspection_questions[question.form_id].push(question);
        if (question.type === 'checkbox')
          $scope.inspection_responses[question.form_id][question.id] = question.options.defaultValue.toLowerCase() == 'yes' ? true : false;
        else
          $scope.inspection_responses[question.form_id][question.id] = question.options.defaultValue;
      });

      $scope.isDataLoaded = true;

      $timeout(function() {
        $scope.$broadcast('ba-wizard-force-step', { step: 0 });
      }, 0);

      // The driver has already filled in.
      if (result[3].data && result[3].data.length) {
        $ngBootbox.confirm('Looks like you have already filled in the inspection form.<br/>Would you like to update your answers?')
          .then(function() {
            $scope.force_update = true;
          }, function() {
            $state.go('dashboard');
          });
      }
    }

    function fnOnDataLoadFailed(response) {
      toastr.error('Failed to load data from the server!');

      $state.go('dashboard');
    }

    function fnGetQuestionsByformId(form_id, total_part, part_index) {
      if (!total_part || total_part == 1)
        return $scope.inspection_questions[form_id];
      else {
        var length = $scope.inspection_questions[form_id].length;
        var count_per_part = Math.floor(length / total_part);
        var remaining = length % total_part;
        var start_index = count_per_part * part_index + Math.min(part_index, remaining);
        return $scope.inspection_questions[form_id].slice(start_index, start_index + count_per_part + (part_index < remaining ? 1 : 0));
      }
    }

    function fnNext(bSubmit) {
      if (!bSubmit)
        $scope.$broadcast('ba-wizard-next-step');
      else {
        var responses = [];
        for (var form_id in $scope.inspection_responses) {
          for (var question_id in $scope.inspection_responses[form_id]) {
            var item = {
              driver_id: Auth.getCurrentUser().id,
              category_id: category_id,
              form_id: form_id,
              question_id: question_id,
              response: $scope.inspection_responses[form_id][question_id]
            };

            var question = $scope.inspection_questions[form_id].find(function(object) { return object.id == question_id; });
            if (question && question.type == 'checkbox') {
              item.response = item.response ? question.options.okValue : question.options.cancelValue;
            }
            responses.push(item);
          }
        }

        $scope.isSubmitting = true;
        InspectionService.addResponses({
          driver_id: Auth.getCurrentUser().id,
          category_id: category_id,
          force_update: $scope.force_update,
          responses: responses
        }).$promise.then($scope.onDataSubmitted).catch($scope.onDataSubmitFailed);
      }
    }

    function fnPrevious() {
      $scope.$broadcast('ba-wizard-prev-step');
    }

    function fnOnDataSubmitted(response) {
      $scope.isSubmitting = false;
      if (response.success) {
        toastr.info('Successfully submitted to the server.');
        $state.go('dashboard');
      } else {
        toastr.error(response.message ? response.message : 'Failed to submit data to the server.');
      }
    }

    function fnOnDataSubmitFailed(response) {
      $scope.isSubmitting = false;
      toastr.error('Failed to submit data to the server.');
    }
  }
})();