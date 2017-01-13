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
//    hubot deluge status <Active>, <Allocating>, <Checking>, <Downloading>, <Seeding>, <Paused>, <Error>, <Queued> - gets torrents in the selected status
//    hubot deluge - returns whats downlaoding
//    hubot deluge status - returns downloading
//  Author:
//    Codeiain

module.exports = function (robot) {
    robot.respond(/deluge ?(status)?(.*)/i, function (msg) {

        var status = msg.match[1];
        if (status != undefined && status != null){
            if (status != "Active" && status != "Allocating" && status != "Checking" && status != "Downloading" && status != "Seeding" && status != "Paused" && status != "Error" && status != "Queued"){
                    msg.send("Sorry thats not a valid status");
            }
        }else{
            status = "Downloading";
        }

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
                if (obj["state"] == status) {
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
                    slackMsg.attachments[0].fields.push({
                        "title":"ETA",
                        "value":obj['eta'],
                        "short":true
                    })
                }
            }
            msg.send(slackMsg);
        });
    });


};