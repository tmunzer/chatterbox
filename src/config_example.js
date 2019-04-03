//replace the values to match your developper account and move this file to ./config

module.exports.devAccount = {
    redirectUrl: "https://<server>/oauth/reg",
    clientSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    clientID: "xxxxxxxxx"
}

module.exports.slackAccount = {
    redirectUrl: "https://<server>/slack/oauth",
    clientSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    clientID: "xxxxxxxxxxxxxxx.xxxxxxxxxxxxx",
    scope: "incoming-webhook,commands"
}

module.exports.sparkAccount = {
    redirectUrl: "https://<server>/spark/oauth",
    clientSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    clientID: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    scope: "spark:people_read spark:rooms_read spark:rooms_write spark:messages_write"
}

/******************************************************************************
 *                                MongoDB                                    *
******************************************************************************/
module.exports.mongoConfig = {
    host: "mongo",
    base: "chatterbox"
}

