// Description:
//    Returns the pm2 status for the current server
//
//  Dependencies:
//    nome
//
//  Configuration:
//    None
//
//  Commands:
//    hubot pm2 status
//  Author:
//    Codeiain

var child_process = require('child_process');

module.exports = function(robot){
   robot.respond(/pm2 status/i, function (msg) {
        child_process.exec('pm2 list', function (error, stdout, stderr) {
            msg.send (stdout);
        });
    });
}


 

