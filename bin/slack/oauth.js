var https = require('https');

/**
 * HTTP GET Request
 * @param {String} code - Code sent by ACS during OAuth process
 * @param {Object} slackAccount - information about the Slack developper account to user
 * @param {String} slackAccount.clientID - Slack Developper Account ClientID
 * @param {String} slackAccount.clientSecret - Slack Developper Account secret
 * @param {String} slackAccount.redirectUrl - Slack Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function (code, slackAccount, callback) {
    var options = {
        'host': 'slack.com',
        'port': 443,
        'path': '/api/oauth.access?client_id=' + slackAccount.clientID +
        '&client_secret=' + slackAccount.clientSecret +
        '&code=' + code +
        '&redirect_uri=' + slackAccount.redirectUrl,
        'method': 'GET'
    };
    var req = https.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
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

