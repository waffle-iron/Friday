// Description:
//    Shows status of my Pis
//
//  Dependencies:
//    None
//
//  Configuration:
//    None
//
//  Commands:
//    hubot get status <server name>  <cpu> <mem> <temp> <all>
//  
//  Author:
//    Codeiain


var CIStringBuilder = require('cistringbuilder');

module.exports = function (robot) {

    var port = '9000';
    var apis = [
        {
            'endpoint': '/getCPUUsage',
            'description': 'get Current CPU usage',
            'name': 'cpu'
        },
        {
            'endpoint': '/getMem',
            'description': 'get current used memory',
            'name': 'mem'
        },
        {
            'endpoint': '/getTemp',
            'description': 'gets the current temputure of the server',
            'name': 'temp'
        },
        {
            'endpoint': '/all',
            'description': 'Gets all the api data',
            'name': 'all'
        }
    ];

    var Servers = [
        {
            'name': 'Dev Server',
            'ip': '192.168.1.18'
        },
        {
            'name': 'Media Server',
            'ip': '192.168.1.5'
        }
    ];

    'use stricted';
    robot.respond(/Get status (.*) (.*)?/i, function (msg) {
        var server = GetByName(Servers, msg.match[1]);
        var dataType = msg.match[2];
        var url = urlBuilder(server, dataType);
        console.log('url = ' + url);
        msg.send('Gathering the require data');
        robot.http(url).get()(function (err, res, body) {
            if (err) {
                msg.send('Can\'t connect to end point');
            } else {
                var pidata = JSON.parse(body);
                var slackMsg = {
                    "attachments": [
                        {
                            "fallback": "Data for " + server.name,
                            "pretext": "Data for" + server.name,
                            "fields": []
                        }
                    ]
                };
                if (pidata.length === 1) {
                    slackMsg.attachments[0].fields.push({
                        "title": pidata[0].type,
                        "value": pidata[0].usage,
                        "short": true
                    });
                } else {
                    for (var x = 0; x < pidata.length; x++) {
                        slackMsg.attachments[x].fields.push({
                            "title": pidata[x].type,
                            "value": pidata[x].usage,
                            "short": true
                        });
                    }
                }
                msg.send(slackMsg);
            }
        });




    });

    function GetByName(arr, value) {

        var result = [];
        for (var x = 0; x < arr.length; x++) {
            if (arr[x].name.toUpperCase() === value.toUpperCase()) {
                result.push(arr[x]);
            }
        }
        return result ? result[0] : null;
    }

    function urlBuilder(server, option) {
        var sb = new CIStringBuilder();
        sb.appendFormat('http://{0}:{1}', [server.ip, port]);
        if (option === undefined || option === null) {
            option = 'all';
        }
        var selectedOption = GetByName(apis, option);
        sb.append(selectedOption.endpoint);
        // create url

        return sb.toString();
    }
};