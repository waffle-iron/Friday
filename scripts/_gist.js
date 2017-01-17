
function checkStore(callback) {
    var redis = require('redis');
    var redisClient = redis.createClient();

    redisClient.get('Gists', function (err, reply) {
        if (reply == null) {
            getGists(function (gists) {
                redisClient.set('Gists', JSON.stringify(gists));
                redisClient.expire('Gists', 120);
                callback(gists);
            });
        } else {
            callback(JSON.parse(reply));
        }
    });
}


function today() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    return today;
}

function getGists(callback) {
    var github = require('octonode');
    var https = require('https');

    var client = github.client({
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD
    });

    var ghme = client.me();
    var ghgist = client.gist();

    client.get('/user', {}, function (err, status, body, headers) {
        ghgist.list(function (err, status, body, headers) {
            var files = [];
            for (var x = 0; x < status.length; x++) {
                getGistContent(status[x], function (gist) {
                    files.push(gist);
                    if (files.length == status.length) {
                        callback(files);
                    }
                })

            }

        })
    });

}

function getGistContent(status, callback) {

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
                'id': status.id,
                'description': status.description,
                'language': status.files[key[0]].language,
                'raw_url': status.files[key[0]].raw_url,
                'content': body,
                'tags': tags
            }
            callback(gist);
        }
    })

}

return new rs.Promise(function (resolve, reject) {
    var tagToFind = args[0];
    checkStore(function (gists) {
        var msg = ''
        if (tagToFind != undefined && tagToFind != null) {
            for (var x = 0; x < gists.length; x++) {
                for (var i = 0; i < gists[x].tags.length; i++) {
                    if (gists[x].tags[i] == args[0].toUpperCase()) {
                        msg += gists[x].description + "\n"
                    }
                }
            }
        } else {
            for (var x = 0; x < gists.length; x++) {
                msg += gists[x].description + "\n"
            }
        }

        resolve(msg);
    });
});
