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
//    hubot Get IP
//  Author:
//    Codeiain


module.exports = function (robot) {
    robot.respond(/get IP/i, function (msg) {
        getGlobalIP(function (ip) {
            msg.send("My public IP address is: " + ip);
        });

    });
};

function getGlobalIP(callback) {
    var http = require('http');

    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function (resp) {
        resp.on('data', function (ip) {
            console.log("My public IP address is: " + ip);
            callback(ip)

        });
    });
}