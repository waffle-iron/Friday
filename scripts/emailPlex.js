// Description:
//      sends a email to plex to add a video to your watch later 
//      if using gmail less secure apps need to be acivated 
//      https://www.google.com/settings/security/lesssecureapps
//
//  Dependencies:
//    nodemailer
//
//  Configuration:
//      HUBOT_SMTP_HOST 'smtp.gmail.com'
//      HUBOT_SMTP_PORT 465
//      HUBOT_SMTP_USER
//      HUBOT_SMTP_PASS
//      HUBOT_SMTP_FROM
//      HUBOT_SMTP_TO
//
//  Commands:
//    hubot Save video <url>
//  Author:
//    Codeiain

const nodemailer = require('nodemailer');

module.exports = function (robot) {

    var SMTPHost = process.env.HUBOT_SMTP_HOST;
    var SMTPPort = process.env.HUBOT_SMTP_PORT; 
    var SMTPUser = process.env.HUBOT_SMTP_USER;
    var SMTPPass = process.env.HUBOT_SMTP_PASS;
    var SMTPFrom = process.env.HUBOT_SMTP_FROM;
    var SMTPTo = process.env.HUBOT_SMTP_TO;

    robot.respond(/Save video (.*)/i, function (msg) {
        if (msg.match[1] !== undefined) {

            let transporter = nodemailer.createTransport({
                host: SMTPHost,
                port: SMTPPort,
                secure: true,
                auth: {
                    user: SMTPUser,
                    pass: SMTPPass
                }
            });
            let mailOptions = {
                from: SMTPFrom,
                to: SMTPTo,
                subject: 'Watch Later',
                text: msg.match[1]
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    msg.send(error);
                } else {
                    msg.send('Message: ' + info.messageId + ' sent: ' + info.response)
                }

            })
        }
    });

};