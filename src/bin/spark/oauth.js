var https = require('https');
const qs = require('querystring');
/**
 * getPermanentToken Request
 * @param {String} code - Code sent by ACS during OAuth process
 * @param {Object} sparkAccount - information about the Spark developper account to user
 * @param {String} sparkAccount.clientID - Spark Developper Account ClientID
 * @param {String} sparkAccount.clientSecret - Spark Developper Account secret
 * @param {String} sparkAccount.redirectUrl - Spark Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function (code, sparkAccount, callback) {
    // form data
    const postData = qs.stringify({
        grant_type: "authorization_code",
        client_id: sparkAccount.clientID,
        client_secret: sparkAccount.clientSecret,
        code: code,
        redirect_uri: sparkAccount.redirectUrl
    });

    const options = {
        'host': 'api.ciscospark.com',
        'port': 443,
        'path': '/v1/access_token',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    req(options, postData, callback);
};


/**
 * refreshToken Request
 * @param {String} refreshToken - Spark API refresh code 
 * @param {Object} sparkAccount - information about the Spark developper account to user
 * @param {String} sparkAccount.clientID - Spark Developper Account ClientID
 * @param {String} sparkAccount.clientSecret - Spark Developper Account secret
 * @param {String} sparkAccount.redirectUrl - Spark Developper Account redirectUrl
 *  */
module.exports.refreshToken = function (refreshToken, sparkAccount, callback) {
        // form data
    const postData = qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_secret: sparkAccount.clientSecret,
        client_id: sparkAccount.clientID
    });

    const options = {
        'host': 'api.ciscospark.com',
        'port': 443,
        'path': '/v1/access_token',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    req(options, postData, callback);
}

function req(options, body, callback) {
    let chunks = [];
    const req = https.request(options, function (res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:', res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function (err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(JSON.parse(err));
    });

    // write data to request body
    req.write(body);
    req.end();
}