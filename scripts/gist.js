// Description:
//    Loads gists for a user
//
//  Dependencies:
//    None
//
//  Configuration:
//    None
//
//  Commands:
//    hubot Get gists
//    hubot get gist <id>
//  Author:
//    Codeiain

var github = require('octonode');
var http = require('http');

var client = github.client({
    username: process.env.GITHUB_USERNAME,
    password: process.env.GITHUB_PASSWORD
});

var ghme = client.me();
var ghgist = client.gist();

module.exports = function (robot) {
    robot.respond(/get gists/i, function (msg) {
        msg.send('Getting gists from Server');
        getGist(function (gists) {
            var slackMsg = {
                "attachments": [
                    {
                        "fallback": "All Gists",
                        "pretext": "All Gists",
                        "fields": [],
                    }
                ]
            };
            for (var i = 0; i < gists.length; i++) {
                slackMsg.attachments[0].fields.push({
                    "title": "ID",
                    "value": gists[i].id,
                    "short": true
                });
                slackMsg.attachments[0].fields.push({
                    "title": "Name",
                    "value": gists[i].description,
                    "short": true
                });
            }
            msg.send(slackMsg);
        })
    });

    robot.respond(/get gist (.*)/i, function (msg) {
        var id = msg.match[1];
        msg.send('Getting gists from Server');
        getGist(function (gist) {
            for (var x = 0; x < gist.length; x++) {
                if (gist[x].id == id) {
                    var slackMsg = {
                        "attachments": [
                            {
                                "fallback": "Gist " + gist[x].description,
                                "pretext": gist[x].description,
                                "text": gist[x].content,
                                "fields": []
                            }
                        ]
                    };
                    
                    for (var i = 0; i < gist[x].tags.length; i++) {
                        slackMsg.attachments[0].fields.push({
                            "title": "Tag",
                            "value":gist[x].tags[i],
                            "short": true
                        });
                    }
                    msg.send(slackMsg);
                    return;
                }
            }
        });
    })

    function getGist(callback) {
        client.get('/user', {}, function (err, status, body, headers) {
            console.log('client Connected');
            ghgist.list(function (err, status, body, header) {
                if (err) {
                    console.log('Error: ' + err);
                } 
                var files = [];
                for (var x = 0; x < status.length; x++) {
                    getGistContent(x, status[x], function (gist) {
                        files.push(gist);
                        if (files.length == status.length) {
                            callback(files);
                        }
                    })
                }
            })
        });
    }

    function getGistContent(id, status, callback) {

        var request = require('request');
        var key = Object.keys(status.files);
        request(status.files[key[0]].raw_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var matches = status.description.match(/\[(.*?)\]/);
                if (matches) {
                    var tagString = matches[1];
                    var tags = tagString.split("|");
                }
                var gist = {
                    'id': id,
                    'description': status.description,
                    'language': status.files[key[0]].language,
                    'raw_url': status.files[key[0]].raw_url,
                    'content': body,
                    'tags': tags
                }
                callback(gist);
            }
        });

    }
}