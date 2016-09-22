// Description:
//   holiday detector script
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//

var Path = require('path'),
    Fs = require('fs'),
    wit = require('node-wit'),
    Guid = require('guid');

var ACCESS_TOKEN = "XKOQ5VQDJ4WIV7ONS2ISWGW7IFTUZEWF";

var greetings = require('./Chat/greetings.json');

module.exports = function (robot) {
    robot.respond(/(.*)/i, function (msg) {
        var help = getHelpCommands(robot);
        robot_name = robot.alias || robot.name;
        if (contains(help, msg.message.text.replace(robot_name, "").trim()) == false) {
            sendToWit(msg.message.text, function (obj) {
                parseWitResponce(obj, function (message) {
                    if (message != "") {
                        msg.reply(JSON.stringify(message));
                    }
                });
            });
        }
    });


    function sendToWit(message, callback) {
        wit.captureTextIntent(ACCESS_TOKEN, message, function (err, res) {
            callback(res);
        })
    };


    function parseWitResponce(responce, callback) {

        switch (responce.outcomes[0].intent.toUpperCase()) {
            case "GREETINGS":
                callback(randomChoice(greetings.greetings));
                break;
            default:
                callback("");
                break;
        }

    }

    function randomChoice(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    getHelpCommands = function (robot) {
        var help_commands, robot_name;
        help_commands = robot.helpCommands();
        var invalid = [];
        for (var i = 0, len = help_commands.length; i < len; i++) {
            help_commands[i] = help_commands[i].replace(/^hubot/i, "");
            help_commands[i] = help_commands[i].trim();
            var temp = help_commands[i].split(' ');
            if (temp[0] != "the" && contains(invalid, temp[0]) == false) {
                invalid.push(temp[0]);
            }
        }
        return invalid;
    };

    function contains(a, obj) {
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }
}