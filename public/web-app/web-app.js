var chatterbox = angular.module('chatterbox', [
    'ngMaterial', 'ngSanitize', 'md.data.table'
]);

chatterbox
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue")
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    });

chatterbox.controller('AppCtrl', function ($scope, SlackService, SparkService) {
    $scope.slack_selected = [];
    $scope.salck_selectAllChecked = false;
    $scope.slack_query = {
        order: 'name',
        limit: 5,
        page: 1,
        show: false,
        filter: "",
    };
    $scope.slack_data = [];
    var slack_data = [];

    $scope.spark = [];
    $scope.spark_selectAllChecked = false;
    $scope.spark_query = {
        order: 'name',
        limit: 5,
        page: 1,
        show: false,
        filter: "",
    };
    $scope.spark_data = [];
    var spark_data = [];

    $scope.removeSlackFilter = function () {
        $scope.slack_query.show = false;
        $scope.slack_query.filter = '';
    };
    $scope.removeSparkFilter = function () {
        $scope.slack_query.show = false;
        $scope.slack_query.filter = '';
    };
    $scope.deleteSlackAccounts = function () {
        var ids = [];
        $scope.slack_data.forEach(function (slack) {
            if (slack.selected) {
                ids.push(slack._id);
            }
        });
        var slack_request = SlackService.remove(ids);
        slack_request.then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $scope.updateSlackAccounts();
        })
    }
    $scope.deleteSparkAccounts = function () {
        var ids = [];
        $scope.spark_data.forEach(function (spark) {
            if (spark.selected) {
                ids.push(spark._id);
            }
        });
        var spark_request = SparkService.remove(ids);
        spark_request.then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $scope.updateSparkAccounts();
        })
    }

    $scope.updateSlackAccounts = function () {
        var slack_request = SlackService.get();
        slack_request.then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $scope.slack_data = slack_data = promise.data.slack;
        })
    }
        $scope.updateSparkAccounts = function () {
        var spark_request = SparkService.get();
        spark_request.then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $scope.spark_data = spark_data = promise.data.spark;
        })
    }

    $scope.selectAllSlack = function () {
        if ($scope.slack_data) {
            $scope.slack_data.forEach(function (slack) {
                slack.selected = $scope.slack_selectAllChecked;
            });
        }
    };
        $scope.selectAllSpark = function () {
        if ($scope.spark_data) {
            $scope.spark_data.forEach(function (spark) {
                spark.selected = $scope.spark_selectAllChecked;
            });
        }
    };

    $scope.selectOneSlack = function (slack, row) {
        if (row) slack.selected = !slack.selected;
    };
        $scope.selectOneSpark = function (spark, row) {
        if (row) spark.selected = !spark.selected;
    };

    $scope.$watch("slack_query.filter", function () {
        $scope.slack_data = [];
        slack_data.forEach(function (slack) {
            if ($scope.slack_query.filter == ""
                || (slack.team_id && slack.team_id.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.team_name && slack.team_name.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.user_id && slack.user_id.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.incoming_webhook.channel && slack.incoming_webhook.channel.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.incoming_webhook.channel_id && slack.incoming_webhook.channel_id.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0))
                $scope.slack_data.push(slack);
        })
    });
    $scope.$watch("spark_query.filter", function () {
        $scope.spark_data = [];
        spark_data.forEach(function (spark) {
            if ($scope.slack_query.filter == ""
                || (slack.emails && slack.emails.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.displayName && slack.displayName.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.user_id && slack.user_id.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0)
                || (slack.nickName && slack.nickName.toString().toLowerCase().indexOf($scope.slack_query.filter.toString().toLowerCase()) >= 0))                
                $scope.slack_data.push(slack);
        })
    });

    $scope.updateSlackAccounts();
    $scope.updateSlackAccounts();
});