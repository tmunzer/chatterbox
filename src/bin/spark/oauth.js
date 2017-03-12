var https = require('https');
const querystring = require('querystring');
/**
 * HTTP GET Request
 * @param {String} code - Code sent by ACS during OAuth process
 * @param {Object} sparkAccount - information about the Slack developper account to user
 * @param {String} sparkAccount.clientID - Slack Developper Account ClientID
 * @param {String} sparkAccount.clientSecret - Slack Developper Account secret
 * @param {String} sparkAccount.redirectUrl - Slack Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function (code, sparkAccount, callback) {


    // form data
    var postData = querystring.stringify({
        grant_type: "authorization_code",
        client_id: sparkAccount.clientID,
        client_secret: sparkAccount.clientSecret,
        code: code,
        redirect_uri: sparkAccount.redirectUrl
    });
    var options = {
        'host': 'api.ciscospark.com',
        'port': 443,
        'path': '/v1/access_token',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, function (res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:',res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    // write data to request body
    req.write(postData);
    req.end();
};

