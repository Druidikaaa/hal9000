const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;

var mirrors;

require('fs').readFile('./mirrors.json', 'utf8', function (err, data) {
    if (err) 
       console.log('error while reading file');

    mirrors = JSON.parse(data);
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
  if (isMessageChannelInMirrorList(message.channel)) {
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
        mirrorChannel.send(mirrorMessage, new Discord.Attachment(message.attachments.array()[0].url))
      }

    }
  }
});

client.on('message', msg => {
  
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

  if(msg.channel.id === councilId 
      && msg.content === '!:cleanse' 
      && msg.author.id === myId) {
    console.log('Versuche zu loeschen');
    deleteStuff();
  }
});

client.login(token);

function isMessageChannelInMirrorList(channel) {
  var originList = mirrors.originList;

  for (var i = 0; i < originList.length; i++) {
    if (originList[i].id === channel.id) {
      return true;
    }
  }
  return false;
}