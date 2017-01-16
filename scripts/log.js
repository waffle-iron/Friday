// Description:
//    Stores log entries within redis
//
//  Dependencies:
//    None
//
//  Configuration:
//    None
//
//  Commands:
//    hubot new log <text to log>
//  Author:
//    Codeiain

module.exports = function(robot){
    robot.respond(/new log\s(.*)/i, function(msg){
        log = msg.match[1];
        savedlogs = robot.brain.get('customLogs');
        if (savedlogs == null || savedlogs == undefined){
            savedlogs = [];
        }
        savedlogs.push({'date':Date.now(), 'log': log});
        robot.send(savedlogs);
        robot.brain.set('logs', savedlogs);
    });

}


        