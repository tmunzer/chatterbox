var https = require('https');
const querystring = require('querystring');

/**
 * HTTP GET Request
 * @param {String} code - Code sent by ACS during OAuth process
 * @param {Object} slackAccount - information about the Slack developper account to user
 * @param {String} slackAccount.clientID - Slack Developper Account ClientID
 * @param {String} slackAccount.clientSecret - Slack Developper Account secret
 * @param {String} slackAccount.redirectUrl - Slack Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function (code, state, slackAccount, callback) {
    var query = querystring.stringify({
        client_id: slackAccount.clientID,
        client_secret: slackAccount.clientSecret,
        code: code,
        state: state,
        redirect_uri:slackAccount.redirectUrl
    })
    var options = {
        'host': 'slack.com',
        'port': 443,
        'path': '/api/oauth.access?' + query,
        'method': 'GET'
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
    req.write('\n');
    req.end();
};

