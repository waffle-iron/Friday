// Description:
//    Loads gists for a user
//
//  Dependencies:
//    nodemailer
//
//  Configuration:
//    None
//
//  Commands:
//    hubot Get gists
//    hubot get gist <id>
//  Author:
//    Codeiain
const nodemailer = require('nodemailer');

module.exports = function(robot){

    var SMTPServer = process.env.HUBOT_SMTP_SERVER;
    var SMTPUser = process.env.HUBOT_SMTP_USER;
    var SMTPPass = process.env.HUBOT_SMTP_PASS;
    var SMTPFrom = process.env.HUBOT_SMTP_FROM;
    var SMTPTo = process.env.HUBOT_SMTP_TO;

    robot.respond(/Save video (.*)/i, function(msg){
        if(msg.match[1] !== undefined){

            let transporter = nodemailer.createTransport({
                service:SMTPServer,
                auth:{
                    user:SMTPUser,
                    pass: SMTPPass
                }
            });
            let mailOptions = {
                from: SMTPFrom,
                to: SMTPTo,
                subject: 'Watch Later',
                text: msg.match[1]
            };
            transporter.sendMail(mailOptions, (error, info) =>{
                if (error){
                    msg.send(error);
                }else{
                    msg.send('Message %s sent: %s', info.messageId, info.response)
                }

            } )
        }
    });

};