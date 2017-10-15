/**
 * @author v.lugovksy
 * created on 16.12.2015
 *
 * Modified by Anthony on Oct 7, 2017
 */
(function() {
  'use strict';

  angular.module('GasNinjasAdmin.pages.dashboard')
    .controller('DashboardLineChartCtrl', DashboardLineChartCtrl);

  /** @ngInject */
  function DashboardLineChartCtrl($scope, $http, appConfig, baConfig, layoutPaths, baUtil, ZipcodeService) {
    var layoutColors = baConfig.colors;
    var graphColor = baConfig.theme.blur ? '#000000' : layoutColors.primary;

    $scope.fetchZipcodes = fnFetchZipcodes;

    $scope.zipcodes = {
      list: [],
      page: 1,
      selected: null,
      loading: false,
      hasMore: true,
    };

    $scope.chartData = [];

    // function zoomChart() {
    //   $scope.chart.zoomToDates(new Date(2012, 11), new Date(2013, 1));
    // }



    // zoomChart();
    // if ($scope.chart.zoomChart) {
    //   $scope.chart.zoomChart();
    // }
    // 

    $scope.$watch('zipcodes.list', function(newVal, oldVal) {
      if (newVal == oldVal || $scope.zipcodes.selected) return;

      $scope.zipcodes.selected = newVal[0];
    })

    $scope.$watch('zipcodes.selected', function(newVal, oldVal) {
      $http({
        method: 'GET',
        url: appConfig.API_URL + '/prices/get_records_by_zipcode/' + (newVal ? newVal.zipcode : ''),
      }).then(function(response) {
        $scope.chartData = [];

        var data = response.data;
        if (data && data.success && data.prices) {
          for (var i = 0, len = data.prices.length; i < len; i++) {
            $scope.chartData.push({
              date: new Date(data.prices[i].created_et),
              price_87: parseFloat(data.prices[i].price_87).toFixed(3),
              price_93: parseFloat(data.prices[i].price_93).toFixed(3),
            });
          }

          $scope.chart = AmCharts.makeChart('amchart', {
            type: 'serial',
            theme: 'blur',
            marginTop: 15,
            marginRight: 15,
            dataProvider: $scope.chartData,
            categoryField: 'date',
            categoryAxis: {
              parseDates: true,
              gridAlpha: 0,
              color: layoutColors.defaultText,
              axisColor: layoutColors.defaultText
            },
            valueAxes: [{
              minVerticalGap: 50,
              gridAlpha: 0,
              color: layoutColors.defaultText,
              axisColor: layoutColors.defaultText
            }],
            graphs: [{
                id: 'g0',
                bullet: 'none',
                useLineColorForBulletBorder: true,
                lineColor: baUtil.hexToRGB(graphColor, 0.3),
                lineThickness: 1,
                negativeLineColor: layoutColors.danger,
                type: 'smoothedLine',
                valueField: 'price_87',
                fillAlphas: 1,
                fillColorsField: 'lineColor',
                balloonText: "Regular: $[[price_87]]",
              },
              {
                id: 'g1',
                bullet: 'none',
                useLineColorForBulletBorder: true,
                lineColor: baUtil.hexToRGB(graphColor, 0.5),
                lineThickness: 1,
                negativeLineColor: layoutColors.danger,
                type: 'smoothedLine',
                valueField: 'price_93',
                fillAlphas: 1,
                fillColorsField: 'lineColor',
                balloonText: "Premium: $[[price_93]]",
              }
            ],
            chartCursor: {
              categoryBalloonDateFormat: 'MMM DD',
              categoryBalloonColor: '#4285F4',
              categoryBalloonAlpha: 0.7,
              cursorAlpha: 0,
              valueLineEnabled: true,
              valueLineBalloonEnabled: true,
              valueLineAlpha: 0.5
            },
            dataDateFormat: 'DD MM',
            export: {
              enabled: true
            },
            creditsPosition: 'bottom-right',
            zoomOutButton: {
              backgroundColor: '#fff',
              backgroundAlpha: 0
            },
            zoomOutText: '',
            pathToImages: layoutPaths.images.amChart
          });

          // $scope.chart.addListener('rendered', zoomChart);
        }
      });
    });

    function fnFetchZipcodes($select, $event) {
      // no event means first load!
      if (!$event) {
        $scope.zipcodes.page = 1;
        $scope.zipcodes.list = [];
      } else {
        $event.stopPropagation();
        $event.preventDefault();
      }

      $scope.zipcodes.loading = true;

      ZipcodeService.getZipcodeList({
        query_zipcode: $select ? $select.search : '',
        page: $scope.zipcodes.page,
        limit: 10
      }).$promise.then(function(data) {
        $scope.zipcodes.page++;
        $scope.zipcodes.list = $scope.zipcodes.list.concat(data);
        $scope.zipcodes.loading = false;
        if (data.length < 10)
          $scope.zipcodes.hasMore = false;
        else
          $scope.zipcodes.hasMore = true;
      }).catch(function() {
        $scope.zipcodes.hasMore = false;
        $scope.zipcodes.loading = false;
      });
    }
  }
})();