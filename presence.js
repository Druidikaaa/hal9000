const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;
const fs = require('fs');

const presenceChannelId = '391341331839975456';
var presenceChannel;

var lastOnline;

fs.readFile('./lastonline.json', 'utf8', function (err, data) {
    if (err) {
       console.log('error while reading file');
    }
    lastOnline = JSON.parse(data);
});


client.on("ready", () => {
  console.log("I am ready!");

  presenceChannel = client.channels.find('id', presenceChannelId);
});

client.on("message", (message) => {
  if (message.content === "?online") {
    presenceChannel.send(JSON.stringify(lastOnline, null, "\t"));
  }
});

client.on("presenceUpdate", (oldMember, newMember) => {
  logPresenceChange(newMember);
  console.log("oldMember: " + oldMember.presence.status);
  console.log("newMember: " + newMember.presence.status);
  if (newMember.user.presence.status === "online" || oldMember.presence.status === "online") {
    writeLastOnline(newMember);
  }
});

function writeLastOnline(newMember) {
  var foundMember = lastOnline.memberList.filter(function(member) {
    return member.id == newMember.user.id;
  });

  if (foundMember.length === 0) {
    lastOnline.memberList.push({"id" : newMember.user.id, "userOrNickname" : getUserName(newMember), "lastOnline" : getCurrentTimestamp()});
  } else {
    foundMember[0].lastOnline = getCurrentTimestamp();
  }

  writeFile(lastOnline, "lastonline.json");
}

function getCurrentTimestamp() {
  var date = new Date();
  date.setTime(date.getTime() - date.getTimezoneOffset()*60*1000);
  return date.toJSON();
}

function logPresenceChange(newMember) {
  var user = getUserName(newMember);
  var germanPresenceMessage = extractGermanPresenceMessage(newMember.user.presence.status);

  var message = '**' + user + '** ' + germanPresenceMessage;
  presenceChannel.send(message);
}

function getUserName(newMember) {
  if (newMember.nickname == null) {
    return newMember.user.username;
  } else {
    return newMember.nickname;
  }
}

function extractGermanPresenceMessage(status) {
  switch(status) {
    case "online":
      return "ist nun online";
    case "offline":
      return "ist nun offline";
    case "idle":
      return "ist afk";
    case "dnd":
      return "will nicht gestört werden";
    default:
      console.error("this should not happen");
      return "**das sollte nicht passieren**";
  }
}

client.login(token);

function writeFile(object, filename) {
  fs.writeFile(filename, JSON.stringify(object, null, "\t"), (err) => {  
    if (err) throw err;
    console.log('Data written to file');
  });
}