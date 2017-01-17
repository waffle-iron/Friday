// Description:
//    Shows torrent status
//
//  Dependencies:
//    cistringbuilder
//
//  Configuration:
//    None
//
//  Commands:
//    hubot Get IP
//    hubot get sonarr url
//    hubot get deluge url
//  Author:
//    Codeiain

var CIStringBuilder = require('cistringbuilder');

module.exports = function (robot) {
    robot.respond(/get IP/i, function (msg) {
        getGlobalIP(function (ip) {
            msg.send("My public IP address is: " + ip);
        });
    });

    robot.respond(/get sonarr url/i, function(msg){
        getGlobalIP(function (ip){
            var sb = new CIStringBuilder();
            sb.appendFormat('http://{0}:8989',[ip]);
            msg.send(sb.toString());
        });
    })

    robot.respond(/get deluge url/i,function(msg){
        getGlobalIP(function (ip){
            var sb = new CIStringBuilder();
            sb.appendFormat('http://{0}:8112',[ip]);
            msg.send(sb.toString());
        });
    })
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