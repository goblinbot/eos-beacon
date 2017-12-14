/* dependancies verklaren en ophalen */
const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const ip      = require('ip');
const session = require('client-sessions');
/*const fs      = require('fs');*/
const globalSettings = require('./config.js');
/*var bodyParser = require('body-parser');*/


/* CONFIGURATIE: vaste gegevens bij start up. */
var port          = process.env.PORT || globalSettings.sys.port;

globalSettings.sys.localaddress = ip.address() +':'+ port;
globalSettings.data.localaddress = globalSettings.sys.localaddress;

var default_security_level = "Code green - All clear";


/* DYNAMIC DATA: data set to defaults on boot, that can be manipulated by users. */
var dynamicData = {
  countClients  : 0,
  alertLevel    : default_security_level,
  lastBC : "bcdefault",
  portalStatus : "ok"
}


/* INITIALISING THE APP */

app.use(express.static('public'));
app.use(express.static('_includes'));


http.listen(port, function(){

  /* flavor text */
  console.log('\n..\n..');
  console.log('// '+globalSettings['cfg']['appname']+' ////////////');
  console.log('# Initialising ..' );
  console.log('# Loading dependancies ..');
  console.log('-------------------------');
  console.log('# CONNECT DEVICES//USERS TO :');
  console.log(' ? External IP :\n\t- ' + globalSettings.sys['localaddress'] );
  console.log(' ? Internal IP :\n\t- localhost:'+ port  + '\n\t- ' + '127.0.0.1:'+ port );
  console.log('-------------------------');
  console.log('THANK YOU FOR USING '+globalSettings['cfg']['appname']+' INFORMATION & BROADCASTING SERVICES');

  /* writing to eventlog.txt */
  eventLogger('INIT','Beacon succesfully started.');
});



/* pathing / routing */
app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/public/'});
});

/* accessing the eventlog without making the LOGS folder public. */
app.get('/analysisMode', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/LOGS/'});
});

/* Path for the system to request eventlog.txt specificly, without making the LOGS folder public. */
app.get('/systemRequestLogText', function(req, res){
  res.sendFile('eventlog.txt', {"root": __dirname+'/LOGS/'});
});

/* fallback: 404 when non-valid location is requested. */
app.get('*', function(req, res){
  res.sendFile('404.html', {"root": __dirname+'/public/'});
});

io.on('connection', function (socket) {

  dynamicData['countClients'] = io.engine.clientsCount;

  console.log('\t[ + ] '+dynamicData['countClients']+' active client(s).');

  setTimeout(function(){
    /* send FRONTEND data to FRONT */
    socket.emit('startConfig', globalSettings.data);
  },1000);


  socket.on('updateSecurity', function(input){
    var outString = input.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['alertLevel'] = outString;
    io.emit('updateDynamicData', dynamicData);

    console.log('[secLVL] level => '+ input);
    eventLogger('SEC','Security level change => '+ input +'. \n');
  });
  socket.on('updatePortalStatus', function(input){
    var outString = input.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['portalStatus'] = input;
    io.emit('updateDynamicData', dynamicData);
    io.emit('portalfrontend');

    console.log('[portal] status => '+ input);
    eventLogger('portal','Portal status change => '+ input +'. \n');
  });

  // FORCE RESET ::
  socket.on('forceReset', function() {
    dynamicData['lastBC'] = "bcdefault";
    io.emit('F5');

    console.log('[admin] command => FORCE_RESET');
    eventLogger('admin','Force reset activated. \n',1);
  });

  socket.on('requestDynamicData', function (){
    dynamicData['countClients'] = io.engine.clientsCount;
    io.emit('updateDynamicData', dynamicData);
  });


  socket.on('broadcastSend', function(value){

    dynamicData['lastBC'] = value.file;

    io.emit('updateDynamicData', dynamicData);
    io.emit('broadcastReceive', value);

    if (value.duration > 1) {
      setTimeout(function(){
        dynamicData['lastBC'] = 'bcdefault';
        console.log('=> last-bc timer cleared.');
      },value.duration);
    }

    console.log('[broadcast] sent => '+ value['title']);
    eventLogger('broadcast','sent: '+ value['title'] +'. \n');
  });

  socket.on('disconnect', function(){
    dynamicData['countClients'] = io.engine.clientsCount;
    console.log('\t[ - ]' +dynamicData['countClients']+' active client(s).');
    io.emit('updateDynamicData', dynamicData );
  });

  socket.on('auth', function(keycode){
    var checklogincode = 0;
    var loginrank = 0;

    console.log('[AUTH] code received: '+keycode);

    eventLogger('AUTH','auth-code received: '+ keycode +'. \n');

    for (var i in globalSettings.accounts) {

      if(globalSettings.accounts[i].logincode == keycode) {
        checklogincode = 1;
        loginrank = globalSettings.accounts[i].loginrank;
      }
    }

    if(checklogincode == 1) {
      socket.emit('authTrue', keycode, loginrank);
    } else {
      socket.emit('authFalse');
    }
  });

  /* broadcast from adminpanel to index.js. Sends a "play this file!" request to every connected client. */
  socket.on('broadcastAudio', function(audiofile){

    console.log('[audio] => file: '+ audiofile);

    io.emit('playAudioFile', audiofile);
    eventLogger('AUDIO','audio file sent: '+ audiofile +'. \n');
  });


  /* getMedia: function to automatically read audio files into pushable buttons, caused by the adminpanel when logging in with sufficient rights. */
  socket.on('getMedia', function(){

    /*
      getMedia has three seperate folders by default: miscAudio, aliceAudio and daveAudio.
      First, beacon will check if the subfolders actually exist, then read every file and push them into an array.
      Secondly, we push this array to the admin screen to generate the "play audio" buttons
    */
    var miscAudio = [];
    if(fs.existsSync('./public/sounds/audio-misc')) {
      fs.readdir('./public/sounds/audio-misc', (err, files) => {
        files.forEach(file => {
          miscAudio.push(file);
        });
        socket.emit('sendMediaMisc', miscAudio);
      });
    }

    /* copy of misc audio */
    var aliceAudio = [];
    if(fs.existsSync('./public/sounds/audio-alice')) {
      fs.readdir('./public/sounds/audio-alice', (err, files) => {
        files.forEach(file => {
          aliceAudio.push(file);
        });
        socket.emit('sendMediaAlice', aliceAudio);
      });
    }

    /* copy of misc audio */
    var daveAudio = [];
    if(fs.existsSync('./public/sounds/audio-dave')) {
      fs.readdir('./public/sounds/audio-dave', (err, files) => {
        files.forEach(file => {
          daveAudio.push(file);
        });
        socket.emit('sendMediaDave', daveAudio);
      });
    }

  });

});

/* eventLogger writes system logs to /LOGS/eventlog.txt. */
function eventLogger(type, message) {

  // /* grab the current date. */
  // var datum = new Date(), y = datum.getFullYear(), m = datum.getMonth();
  //
  // /* declare log file location, and the result to add to said file. */
  // var logfile = 'LOGS/eventlog.txt';
  // var printresult = "";
  //
  // /* missing values? Don't do anything.*/
  // if(!message || !type) {
  //   return false;
  // } else {
  //
  //   /* grab the current time and format it to our european standards */
  //   var currentTime = new Date();
  //   var currentHours   = currentTime.getHours ( );
  //   var currentMinutes = currentTime.getMinutes ( );
  //     currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
  //     currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  //     currentTime = currentHours + ":" + currentMinutes;
  //
  //     /* add to log: [TYPE] [DATE/TIME] :: [MESSAGE] */
  //     printresult += '[ ' + type + ' ]\t';
  //     printresult += datum.getDate() + '-' + datum.getMonth() + ', '+ currentTime;
  //     printresult += '\t:: ';
  //     printresult += message + '\n';
  //
  //     /* ADD log to txt file by appending. */
  //     fs.appendFile(logfile, printresult, function(err) {
  //       if(err) throw err;
  //     });
  // }

}
