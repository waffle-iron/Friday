var child_process = require('child_process');
var redis = require('redis');
var redisClient = redis.createClient();

var downloaded_updates = false;

function FindByBuildNumber(arr, buildNumber) {
    for (var x = 0; x < arr.length; x++) {
        if (parseInt(arr[x].number, 10) === parseInt(buildNumber, 10)) {
            return arr[x].message;
        }
    }
}



module.exports = function (robot) {

    robot.respond(/update source/i, function (msg) {
        msg.http('https://api.travis-ci.org/repos/codeiain/Friday').get()(function (err, res, body) {
            currentBuildData = JSON.parse(body);
            if (currentBuildData.last_build_status === 0) {
                redisClient.get('fridayVersion', function (err, reply) {
                    var currentBuildNumber = null;
                    if (reply == null) {
                        currentBuildNumber = parseInt(currentBuildData.last_build_number,10);
                    } else {
                        currentBuildNumber = parseInt(reply,10);
                    }

                    msg.send("updating from " + currentBuildNumber + " to " + currentBuildData.last_build_number);
                    msg.http('https://api.travis-ci.org/repos/codeiain/Friday/builds').get()(function (err, res, body) {

                        var allCommits = JSON.parse(body);
                        var lastBuildNumber = parseInt(currentBuildData.last_build_number) + 1;
                        console.log(currentBuildNumber); 
                        //console.log(currentBuildData.last_build_number); 
                        var commitMsg = "";
                        for(var x = currentBuildNumber; x < lastBuildNumber; x ++){
                            //console.log(commitMsg);
                            commitMsg += FindByBuildNumber(allCommits, x);
                            
                        }
                        msg.send(commitMsg);
                    });


                });
            }

        });
        msg.send('Gathering Information ...');
    });


}