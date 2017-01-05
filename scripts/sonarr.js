// Description:
//    general sonarr tasks
//
//  Dependencies:
//    Node
//
//  Configuration:
//    None
//
//  Commands:
//    hubot what's showing today
//    hubot what's showing this week
//    hubot my shows
//    hubot shows
//  Author:
//    Codeiain

module.exports = function (robot) {

    robot.respond(/what\'?s showing (.*)/i, function (msg) {
        var url = 'http://192.168.1.5:8989/api/calendar?apikey=1c622d8bf0d64ddea5ae8562670894aa';

        if (msg.match[1] == 'today') {
            url += '&start=' + today() + '&end=' + today();
        } else if (msg.match[1] == 'this week') {
            var start = getMonday(today());
            var end = getSunday(today());
            url += '&start=' + start + '&end=' + end;
        }
        var slackMsg = {
            "attachments": [
                {
                    "fallback":"List of all shows",
                    "pretext": "Shows",
                    "fields": [],
                }
            ]
        };

        robot.http(url).get()(function (err, res, body) {
            var data = JSON.parse(body);
            if (data.length == 0) {
                msg.send('Sorry but nothing is showing today');
                return;
            }
            for (var i = 0; i < data.length; i++) {


                slackMsg.attachments[0].fields.push({
                    "title": "Series",
                    "value": data[i].series.title,
                    "short": true
                });
                //msg.send(data[i].series.title);
            }
            msg.send(slackMsg);
        });

    });

    robot.respond(/(my)? ?shows/i, function (msg) {
        var url = "http://192.168.1.5:8989/api/series?apikey=1c622d8bf0d64ddea5ae8562670894aa"

        robot.http(url).get()(function (err, res, body) {
            var data = JSON.parse(body);
            var slackMsg = {
                "attachments": [
                    {
                        "fallback":"List of shows",
                        "pretext": "Shows",
                        "fields": [],
                    }
                ]
            };
            for (var i = 0; i < data.length; i++){
                 slackMsg.attachments[0].fields.push({
                    "value": data[i].title,
                    "short": true
                });

            }
            msg.send(slackMsg);
        });
    });

    function today() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff)).toISOString().substring(0, 10);
    }

    function getSunday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        diff = diff + 7;
        return new Date(d.setDate(diff)).toISOString().substring(0, 10);

    }
};