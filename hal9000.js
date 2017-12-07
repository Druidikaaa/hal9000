const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;
const historyId = require('./navigationIds.json').historyId;
const fs = require('fs');

var mirrors;

fs.readFile('./mirrors.json', 'utf8', function (err, data) {
    if (err) {
       console.log('error while reading file');
    }
    mirrors = JSON.parse(data);
    //console.log(JSON.stringify(data, null, "\t"));
});

const myId = '197405517767901186';

const councilId = '373156771398811650';
const councilMirrorId = '381477218292989953';

const rumtestenId = '381479229059104769';
const rumtestenSpiegel = '381488016759455744';

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  mirrorMessageToMirrorChannels(message);

  if (message.content.startsWith("!:")) {
    processCommands(message);
  }
});

function processCommands(message) {
  if (!isAuthorAuthorized(message.author)) {
    message.channel.send("**Denk nicht mal dran!**", { "reply" : message.author})
    return;
  }

  if (message.content === "!:cleanse") {
    if (isMessageChannelInOriginList(message.channel)) {
      deleteStuff(message);
    } else {
      console.log("Channel not in origin list!");
      message.channel.send("**Der Channel wird bisher nicht gespiegelt und kann nicht gesäubert werden!**");
    }
  }

  if (message.content === "!:addMirror") {
    if (isMessageChannelInOriginList(message.channel)) {
      var mirrorChannelId = createMirrorForOrigin(message.channel);
      
    } else {
      console.log("Channel is not yet in origin list!");
      message.channel.send("**Der Channel wird bisher nicht gespiegelt!**");
    }
  }
}

function createMirrorForOrigin(channel) {
  var mirrorChannelName = channel.name + "_seit_" + getCurrentDate();
  console.log(mirrorChannelName);
  var mirrorChannelId;
  channel.guild.createChannel(mirrorChannelName, "text")
    //.then(newChannel => newChannel.setParent(historyId))
    .then(newChannel => addMirrorToOrigin(channel, newChannel.id));
  return mirrorChannelId;
}

function getCurrentDate() {
  var date = new Date();

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return day + month + year;
}

function addMirrorToOrigin(channel, mirrorChannelId) {
  var foundOriginObject = mirrors.originList.filter(function(originItem) {
    return originItem.id == channel.id;
  });

  foundOriginObject[0].mirrorList.push({"id" : mirrorChannelId});

  writeFile(mirrors, "mirrors.json");
}

function writeFile(object, filename) {
  fs.writeFile(filename, JSON.stringify(object, null, "\t"), (err) => {  
    if (err) throw err;
    console.log('Data written to file');
  });
}

function isAuthorAuthorized(author) {
  if (author.id === myId) {
    return true;
  } else {
    return false;
  }
}

function mirrorMessageToMirrorChannels(message) {
  if (isMessageChannelInOriginList(message.channel)) {
    var originalAuthor = '**' + message.author.username + ':** ';
    var mirrorMessage = originalAuthor + message.content;
    
    var originList = mirrors.originList;

    var foundOriginObject = originList.filter(function(originItem) {
      return originItem.id == message.channel.id;
    });

    for (var i = 0; i < foundOriginObject[0].mirrorList.length; i++) {
      var mirrorId = foundOriginObject[0].mirrorList[i].id;
      var mirrorChannel = client.channels.find('id', mirrorId);
      if (message.attachments.array().length == 0) {
        mirrorChannel.send(mirrorMessage);
      } else {
        mirrorChannel.send(mirrorMessage, new Discord.Attachment(message.attachments.array()[0].url));
      }

    }
  }
}

function deleteStuff(msg) {
  
  let deleteStuff = () => {
    let count = 0;
    msg.channel.fetchMessages({limit: 100})
     .then(messages => {
       let messagesArr = messages.array();
       let messageCount = messagesArr.length;

       for(let i = 0; i < messageCount; i++) {
         messagesArr[i].delete()
          .then(function() {
            count = count + 1;
            console.log('geloescht!');
            if(count >= 100) {
              deleteStuff();
              console.log('count >= 100!');
            }
          })
          .catch(function() {
            count = count + 1;
            console.log('hab was gecatcht');
            if(count >= 100) {
              console.log('hab was gecatcht: count >= 100');
              deleteStuff();
            }
          })
       }
     })
     .catch(function(err) {
       console.log('error thrown');
       console.log(err);
     });
  };

  console.log('Versuche zu loeschen');
  deleteStuff();
}

client.login(token);

function isMessageChannelInOriginList(channel) {
  var originList = mirrors.originList;

  for (var i = 0; i < originList.length; i++) {
    if (originList[i].id === channel.id) {
      return true;
    }
  }
  return false;
}