// Description:
//    Shows torrent status
//
//  Dependencies:
//    Node-deluge
//
//  Configuration:
//    None
//
//  Commands:
//    hubot deluge status - Shows all downloading torrents
//  
//  Author:
//    Codeiain

module.exports = function (robot) {
    robot.respond(/deluge ?(status)?(.*)/i, function (msg) {
        msg.send("Just gathering the required information");
        var deluge = require('node-deluge')(process.env.DELUGE_WEB_URL, process.env.DELUGE_PASSWORD, null);
        deluge.get_status(function (data) {
            var torrents = data;
            var slackMsg = {
                "attachments": [
                    {
                        "fallback":"List of all downloading torrents",
                        "pretext": "Current Torrents",
                        "fields": [],
                    }
                ]
            };
            var length = Object.keys(torrents.result.torrents).length;
            for (var key in torrents.result.torrents) {
                var obj = torrents.result.torrents[key];
                if (obj["state"] != "Queued" && obj["state"] != "Paused" && obj["state"] != "Checking") {
                    slackMsg.attachments[0].fields.push({
                        "title": "Name",
                        "value": obj["name"],
                        "short": true
                    });
                    slackMsg.attachments[0].fields.push({
                        "title": "Progress",
                        "value": obj["progress"].toFixed(2) + "%",
                        "short": true
                    });
                }
            }
            msg.send(slackMsg);
        });
    });


};