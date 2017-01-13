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
//    hubot Get status <server name> 
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
        var server = GetByName(msg.match[1]);
        var dataType = msg.match[2];
        var url = urlBuilder(server, dataType);
        robot.http(url).get()(function (err, res, body) {
            var pidata = JSON.parse(body);
            var slackMsg = {
                "attachments": [
                    {
                        "fallback":"Data for " + server.name,
                        "pretext": "Data for" + server.name,
                        "fields": []
                    }
                ]
            };
            if (pidata.length === 1) {

            } else {

            }
        });




    });

    function GetByName(arr, value) {
        var result = arr.filter(function (o) {
            return o.name.toUpperCase() === value.toUpperCase();
        });
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