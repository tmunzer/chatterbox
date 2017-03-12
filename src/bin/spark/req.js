var https = require('https');

/**
 * HTTP GET Request
 * @param {Object} sparkAccessToken - Spark Access Token
 * @param {String} path - path to request the ACS endpoint
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account clientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.GET = function (sparkAccessToken, path, callback) {
    var options = {
        host: 'api.ciscospark.com',
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Authorization': "Bearer " + sparkAccessToken
        }
    };
    httpRequest(options, callback);
};
/**
 * HTTP POST Request
 * @param {Object} sparkAccessToken - Spark Access Token
 * @param {String} path - path to request the ACS endpoint
 * @param {Object} data - data to include to the POST Request
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account clientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.POST = function (sparkAccessToken, path, data, callback) {
    var options = {
        host: 'api.ciscospark.com',
        port: 443,
        path: path,
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json; charset=utf-8',
            'Authorization': "Bearer " + sparkAccessToken
        }
    };
    var body = JSON.stringify(data);
    if (body.length > 400) console.info("\x1b[34mREQUEST DATA\x1b[0m:", body.substr(0, 400) + '...');
    else console.info("\x1b[34mREQUEST DATA\x1b[0m:", body);
    httpRequest(options, callback, body);
};

/**
 * HTTP PUT Request
 * @param {Object} sparkAccessToken - Spark Access Token
 * @param {String} path - path to request the ACS endpoint
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account clientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.PUT = function (sparkAccessToken, path, callback) {
    var options = {
        host: 'api.ciscospark.com',
        port: 443,
        path: path,
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Authorization': "Bearer " + sparkAccessToken
        }
    };
    httpRequest(options, callback);
};

/**
 * HTTP DELETE Request
 * @param {Object} sparkAccessToken - Spark Access Token
 * @param {String} path - path to request the ACS endpoint
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account clientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.DELETE = function (sparkAccessToken, path, callback) {
    var options = {
        host: 'api.ciscospark.com',
        port: 443,
        path: path,
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Authorization': "Bearer " + sparkAccessToken
        }
    };
    httpRequest(options, callback);
};

function httpRequest(options, callback, body) {
    var result = {};
    result.request = {};
    result.result = {};


    result.request.options = options;
    var req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:',result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            var request = result.request;
            if (body) request.body = JSON.parse(body);
            else request.body = {};
            if (data != '') {                
                result.data = JSON.parse(data);
            }
            switch (result.result.status) {
                case 200:
                    callback(null, result.data, request);
                    break;
                default:
                    var error = {};
                    console.error("\x1b[31mRESPONSE ERROR\x1b[0m:", JSON.stringify(error));
                    callback(result.error, result.data, request);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });


    // write data to request body
    req.write(body+'\n');
    req.end();


}