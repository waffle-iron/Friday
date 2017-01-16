var child_process, downloaded_updates, findBybuildNumber, redis, redisClient;

redis = require('redis');

redisClient = redis.createClient();

findBybuildNumber = function (arr, buildnumber) {
    var x;
    x = void 0;
    x = 0;
    while (x < arr.length) {
        if (parseInt(arr[x].number, 10) === parseInt(buildnumber, 10)) {
            return arr[x].message;
        }
        x++;
    }
};

child_process = require('child_process');

downloaded_updates = false;

module.exports = function (robot) {
    robot.respond(/pending updates?\??$/i, function (msg) {
        if (downloaded_updates) {
            return msg.send('I have some pending updates, KILL ME PLEASE! (hint: hubot die)');
        } else {
            return msg.send('I\'m up-to-date!');
        }
    });
    return robot.respond(/update( yourself)?$/i, function (msg) {
        var _error, changes;
        changes = false;
        try {
            return msg.http('https://api.travis-ci.org/repos/codeiain/Friday').get()(function (err, res, body) {
                var response;
                response = JSON.parse(body);
                if (response.last_build_status === 0) {
                    redisClient.get('fridayVersion', function (err, reply) {
                        var currentVersion = reply;
                        msg.http('https://api.travis-ci.org/repos/codeiain/Friday/builds').get()(function (err, res, body) {
                            var _error, commits, error, lastBuild, message, output, x;
                            commits = void 0;
                            error = void 0;
                            message = void 0;
                            output = void 0;
                            x = void 0;
                            if (currentVersion === null) {
                                currentVersion = response.last_build_number;
                            }
                            msg.send("updating from build " + currentVersion + " to " + response.last_build_number);
                            commits = JSON.parse(body);
                            x = parseInt(currentVersion, 10);
                            lastBuild = parseInt(response.last_build_number, 10);
                            lastBuild = lastBuild + 1;

                            while (x < lastBuild) {
                                msg.send(findBybuildNumber(commits, x));
                                console.log(' x ');
                                x++;
                            }
                            msg.send('git pull...');
                            child_process.exec('git pull', function (error, stdout, stderr) {
                                if (error) {
                                    msg.send('git pull failed: ' + stderr);
                                } else {
                                    output = stdout + '';
                                    if (!/Already up\-to\-date/.test(output)) {
                                        msg.send('my source code changed:\n' + output);
                                        changes = true;
                                    } else {
                                        msg.send('my source code is up-to-date');
                                    }
                                }
                            });
                            try {
                                msg.send('npm update...');
                                return child_process.exec('npm update', function (error, stdout, stderr) {
                                    if (error) {
                                        msg.send('npm update failed: ' + stderr);
                                    } else {
                                        output = stdout + '';
                                        if (/node_modules/.test(output)) {
                                            msg.send('some dependencies updated:\n' + output);
                                            changes = true;
                                        } else {
                                            msg.send('all dependencies are up-to-date');
                                        }
                                    }
                                    if (changes) {
                                        downloaded_updates = true;
                                        msg.send('I downloaded some updates, KILL ME PLEASE! (hint: hubot die)');
                                    } else {
                                        if (downloaded_updates) {
                                            msg.send('I have some pending updates, KILL ME PLEASE! (hint: hubot die)');
                                        } else {
                                            msg.send('I\'m up-to-date!');
                                        }
                                    }

                                });
                            } catch (_error) {
                                _error = _error;
                                error = _error;
                                return msg.send('npm update failed: ' + error);
                            }
                            redisClient.set('fridayVersion', lastBuild);
                        });
                    });
                } else if (response !== 0) {
                    return msg.send('Sorry I cant do that my last build faild');
                }
            });
        } catch (_error) {
            _error = _error;
        }
    });
};
