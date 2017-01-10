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
//    hubot add show <Show Name>
//    hubot add show <Show Name> tvdbId <tvdbId>
//  Author:
//    Codeiain

module.exports = function (robot) {

    var SonarrApiKey = process.env.SONARR_KEY
    var baseURL = process.env.SONARR_URL
    var port = process.env.SONARR_PORT != undefined ? process.env.SONARR_PORT : '8989';
    var rootFolderPath = process.env.SONARR_ROOT_FOLDER_PATH

    robot.respond(/what\'?s showing (.*)/i, function (msg) {
        var url = baseURL + ":" + port + "/api/calendar?apikey=' + SonarrApiKey;


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
                    "fallback": "List of all shows",
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
            }
            msg.send(slackMsg);
        });

    });

    robot.respond(/(my)? ?shows/i, function (msg) {
        var url = baseURL + ":" + port + "/api/series?apikey=" + SonarrApiKey
        robot.http(url).get()(function (err, res, body) {
            var data = JSON.parse(body);
            var slackMsg = {
                "attachments": [
                    {
                        "fallback": "List of shows",
                        "pretext": "Shows",
                        "fields": [],
                    }
                ]
            };
            for (var i = 0; i < data.length; i++) {
                slackMsg.attachments[0].fields.push({
                    "value": data[i].title,
                    "short": true
                });

            }
            msg.send(slackMsg);
        });
    });

    robot.respond(/add show (.*)/i, function (msg) {
        var toFind = encodeURIComponent(msg.match[1]);
        var url = baseURL + ":" + port + "/api/series/lookup?term=" + toFind + "&apikey=" + SonarrApiKey
        robot.http(url).get()(function (err, res, body) {
            var showData = JSON.parse(body);
            var http = require('http');
            if (showData.length == 1) {
                var postdata = {
                    'tvdbId': showData[0].tvdbId,
                    'title': showData[0].title,
                    'qualityProfileId': 1,
                    'titleSlug': showData[0].titleSlug,
                    'images': showData[0].images,
                    'seasons': showData[0].seasons,
                    'rootFolderPath': rootFolderPath,
                }
                PostToSonarr(postdata);
            }
            else if (showData.length > 1) {
                var slackMsg = {
                    "attachments": [
                        {
                            "fallback": "The following shows where found",
                            "pretext": "The following shows where found",
                            "fields": [],
                        }
                    ]
                };
                for (var i = 0; i < showData.length; i++) {
                    slackMsg.attachments[0].fields.push({
                        "title": "Name",
                        "value": showData[i].title,
                        "short": true
                    });
                    slackMsg.attachments[0].fields.push({
                        "title": "tvdbId",
                        "value": showData[i].tvdbId,
                        "short": true
                    });

                }
                msg.send(slackMsg);
            }
            else {
                msg.send("Can't find that  show");
            }
        })
    });

    robot.respond(/add show (.*) tvdbId (.*)/i, function (msg) {
        var show = encodeURIComponent(msg.match[1]);
        var tvdbId = msg.match[2];

        var url = baseURL + ":" + port + "/api/series/lookup?term=" + show + "&tvdb=" + tvdbId + "&apikey=" + SonarrApiKey
        robot.http(url).get()(function (err, res, body) {
            var showData = JSON.parse(body);
            var http = require('http');
            if (showData.length == 1) {
                var postdata = {
                    'tvdbId': showData[0].tvdbId,
                    'title': showData[0].title,
                    'qualityProfileId': 1,
                    'titleSlug': showData[0].titleSlug,
                    'images': showData[0].images,
                    'seasons': showData[0].seasons,
                    'rootFolderPath': "/home/pi/fileserv/Shared Videos/TV Shows/",
                }
                PostToSonarr(postdata);
            } else {
                msg.send("cant find required info");
            }
        })
    });

    function PostToSonarr(postdata) {
        var post_options = {
            host: baseURL,
            path: '/api/series',
            method: 'POST',
            port: port,
            headers: {
                'X-Api-Key': SonarrApiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(JSON.stringify(postdata))
            }
        };

        var post_req = http.request(post_options, function (res) {
            console.log(res.statusCode);
            msg.send('blaaa');
            res.setEncoding('utf8');
            var body = '';
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                msg.send(body);
            })
        });
        post_req.on('error', function (e) {
            console.log(`problem with request: ${e.message}`);
        })
        post_req.write(JSON.stringify(postdata));
        post_req.end();
    }


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
