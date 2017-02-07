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

chatterbox.controller('AppCtrl', function ($scope, SlackService) {
    $scope.slack_selected = [];
    $scope.selectAllChecked = false;
    $scope.slack_query = {
        order: 'name',
        limit: 5,
        page: 1,
        show: false,
        filter: "",
    };

    $scope.slack_data = [];
    var slack_data = [];

    $scope.removeSlackFilter = function () {
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

    $scope.updateSlackAccounts = function () {
        var slack_request = SlackService.get();
        slack_request.then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $scope.slack_data = slack_data = promise.data.slack;
        })
    }
    $scope.selectAllSlack = function () {
        if ($scope.slack_data) {
            $scope.slack_data.forEach(function (slack) {
                slack.selected = $scope.selectAllChecked;
            });
        }
    };
    $scope.selectOneSlack = function (slack, row) {
        if (row) slack.selected = !slack.selected;
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

    $scope.updateSlackAccounts();
});