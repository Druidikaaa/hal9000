const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;

const myId = '197405517767901186';

const councilId = '373156771398811650';
const councilMirrorId = '381477218292989953';

const rumtestenId = '381479229059104769';
const rumtestenSpiegel = '381488016759455744';

client.on("ready", () => {
  console.log("I am ready!");
});

/*
client.on("message", (message) => {
  if (message.author.id === myId) {
    console.log('Enno hat in Channel ' + message.channel.id + ' geschrieben!');
  }
});*/


client.on("message", (message) => {
  if (message.channel.id === rumtestenId) {
    const userAndTime = message.author.username + ' ' + message.createdAt + ': ';
    const mirrorMessage = colorizeText(userAndTime) + message.content;

    const channelRumtestenSpiegel = client.channels.find('id', rumtestenSpiegel);
    channelRumtestenSpiegel.send(mirrorMessage);
  }
});

/*
client.on("message", (message) => {
  if (message.channel.id === councilId) {
    const mirrorMessage = message.author.username + ' ' + message.createdAt + ': ' + message.content;

    const channelCouncilMirror = client.channels.find('id', councilMirrorId);
    channelCouncilMirror.send(mirrorMessage);
  }
});*/

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
  console.log(msg.author.id + ' hat: "' + msg.content + '" in Channel ' + msg.channel.id + ' geschrieben!');

  if(msg.channel.id === councilId 
      && msg.content === '!:cleanse' 
      && msg.author.id === myId) {
    console.log('Versuche zu loeschen');
    deleteStuff();
  }
});

client.login(token);

function colorizeText(text) {
  const markDownPrefix = "```fix\n";
  const markDownSuffix = "```"

  return markDownPrefix + text + markDownSuffix;
}