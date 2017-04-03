const CronJob = require("cron").CronJob;
const Spark = require("./models/spark");
const OAuth = require('./spark/oauth');
const sparkAccount = require("../config.js").sparkAccount;

function refreshOldToken() {
    console.info("\x1b[32minfo\x1b[0m:", "Starting process to automatically refresh Spark Access Tokens");

    const tsInOneDay = new Date().setDate(new Date().getDate() + 1);
    // select ACS accounts where:
    // expireAt is not 0 (this means the previous try failed)
    // expireAt is lower than "now + 1 month" (the token will expire in less than one month)
    // refreshTokenExpiresAt is lower than now (the refresh token is not expired)
    Spark
        //.where("expireAt").gt(0)
        .where("expireAt").lte(tsInOneDay)
        .where("refreshTokenExpiresAt").gt(new Date().valueOf())
        .exec(function (err, accounts) {
            if (err) console.error("\x1b[31mERROR\x1b[0m:", err);
            // for every selected accounts, try to refresh the token
            else accounts.forEach(function (account) {
                console.info("\x1b[32minfo\x1b[0m:", "Refreshing Spark token for " + account.displayName + " (" + account.emails + ")");
                OAuth.refreshToken(account.refreshToken, sparkAccount, function (data) {
                    // if refresh succeed, update the account data
                    if (data && data.access_token && data.expires_in) {
                        account.accessToken = data.access_token;
                        account.expireAt = new Date().valueOf() + (data.expires_in * 1000);
                        account.refreshTokenExpiresAt = new Date().setDate(new Date().getDate() + 90);
                        console.info("\x1b[32minfo\x1b[0m:", "Spark Token refreshed for for " + account.displayName + " (" + account.emails + ")");
                        // if all the needed fields are not received:
                        // - set the "expireAt" field to 0 (mean it failed, so we will not try this account next time)
                        // - raise an error
                    } else {
                        account.expireAt = 0;
                        if (data.errors) console.error("\x1b[31mERROR\x1b[0m:", "Unable to refresh the token for for " + account.displayName + " (" + account.emails + ")" + " - " + JSON.stringify(data.errors));
                        else console.error("\x1b[31mERROR\x1b[0m:", "Unable to refresh the token for for " + account.displayName + " (" + account.emails + ")" + " - No data received from ACS?");
                    }
                    // save the updated account
                    account.save(function () {
                        if (err) console.error("\x1b[31mERROR\x1b[0m:", err);
                        else console.info("\x1b[32minfo\x1b[0m:", "Account saved for for " + account.displayName + " (" + account.emails + ")");
                    })
                })
            })
        })
}
//===============CREATE CRON=================
module.exports.auto = function () {
    // run once when the server is starting
    refreshOldToken();
    try {
        console.info("\x1b[32minfo\x1b[0m:", "Spark token autorefresh started");
        new CronJob({
            // run the refresh process every month
            cronTime: "0 0 */1 * * *",
            onTick: function () {
                refreshOldToken();
            },
            start: true
        });
    } catch (ex) {
        console.error("\x1b[31mERROR\x1b[0m:", "cron pattern not valid");
    }
}
