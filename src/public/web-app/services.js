chatterbox.factory("SlackService", function ($http, $q) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/slack/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function remove(ids) {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/slack/",
                method: "DELETE",
                params: { ids: ids },
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
            get: get,
            remove: remove
        }
    })

chatterbox.factory("SparkService", function ($http, $q) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/spark/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function remove(ids) {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/spark/",
                method: "DELETE",
                params: { ids: ids },
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
            get: get,
            remove: remove
        }
    })

