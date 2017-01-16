# Description:
#   Example scripts for you to examine and try out.
#
# Notes:
#   They are commented out by default, because most of them are pretty silly and
#   wouldn't be useful and amusing enough for day to day huboting.
#   Uncomment the ones you want to try and experiment with.
#
#   These are from the scripting documentation: https://github.com/github/hubot/blob/master/docs/scripting.md


redis = require('redis')
redisClient = redis.createClient()

findBybuildNumber = (arr, buildnumber) ->
  x = undefined
  x = 0

  while x < arr.length
    if parseInt(arr[x].number, 10) == parseInt(buildnumber, 10)
      return arr[x].message
    x++
  return

child_process = require('child_process')
downloaded_updates = false

module.exports = (robot) ->
  robot.respond /pending updates?\??$/i, (msg) ->
    if downloaded_updates
      msg.send 'I have some pending updates, KILL ME PLEASE! (hint: hubot die)'
    else
      msg.send 'I\'m up-to-date!'
  robot.respond /update( yourself)?$/i, (msg) ->
    changes = undefined
    changes = false
    try
      return msg.http('https://api.travis-ci.org/repos/codeiain/Friday').get()((err, res, body) ->
        response = JSON.parse(body)
        if response.last_build_status == 0
          redisClient.get 'fridayVersion', (err, reply) ->
            currentVersion = undefined
            currentVersion = reply
            
            msg.http('https://api.travis-ci.org/repos/codeiain/Friday/builds').get() (err, res, body) ->
              commits = undefined
              error = undefined
              message = undefined
              output = undefined
              x = undefined
              commits = JSON.parse(body)
              x = parseInt(currentVersion, 10)
              lastBuild = parseInt(response.last_build_number, 10)
              lastBuild = lastBuild + 1
              msg.send "updating from build " + currentVersion + " to " + response.last_build_number
              while x < lastBuild
                msg.send findBybuildNumber(commits, x)
                x++
              return
              msg.send 'git pull...'
              child_process.exec 'git pull', (error, stdout, stderr) ->
              if error
                msg.send 'git pull failed: ' + stderr
              else
                output = stdout + ''
                if !/Already up\-to\-date/.test(output)
                  msg.send 'my source code changed:\n' + output
                  changes = true
                else
                  msg.send 'my source code is up-to-date'
              try
                msg.send 'npm update...'
                return child_process.exec('npm update', (error, stdout, stderr) ->
                  if error
                    msg.send 'npm update failed: ' + stderr
                  else
                    output = stdout + ''
                    if /node_modules/.test(output)
                      msg.send 'some dependencies updated:\n' + output
                      changes = true
                    else
                      msg.send 'all dependencies are up-to-date'
                  if changes
                    downloaded_updates = true
                    msg.send 'I downloaded some updates, KILL ME PLEASE! (hint: hubot die)'
                  else
                    if downloaded_updates
                      msg.send 'I have some pending updates, KILL ME PLEASE! (hint: hubot die)'
                    else
                      msg.send 'I\'m up-to-date!'
                  redisClient.set 'fridayVersion', lastBuild
                )
              catch _error
                error = _error
                return msg.send('npm update failed: ' + error)
              return
            return
        else if response != 0
          return msg.send('Sorry I cant do that my last build faild')
        return
      )
    catch _error
    return

