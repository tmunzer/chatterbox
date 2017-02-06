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

    $scope.slack_query = {
        order: 'name',
        limit: 5,
        page: 1
    };

    $scope.slack_data = [];
    var slack_request = SlackService.get();
    slack_request.then(function (promise) {        
        if (promise && promise.error) console.log(promise.error);
        else $scope.slack_data = promise.data.slack;
    })
})
    .factory("SlackService", function ($http, $q, $rootScope) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/slack/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function httpReq(request) {
            var promise = request.then(
                function (response) {
                    return response;
                },
                function (response) {
                    return { error: response.data };
                });

            promise.abort = function () {
                canceller.resolve();
            };
            promise.finally(function () {
                console.info("Cleaning up object references.");
                promise.abort = angular.noop;
                canceller = request = promise = null;
            });

            return promise;
        }

        return {
            get: get
        }
    })

