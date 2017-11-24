/* dependancies verklaren en ophalen */
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var ip      = require('ip');
/*var bodyParser = require('body-parser');*/
var session = require('client-sessions');
var fs = require('fs');

/* experiment */
/*var device = require('device');*/


var globalSettings = require('./config.js');

/* CONFIGURATIE: vaste gegevens bij start up. */
var port          = process.env.PORT || globalSettings.sys.port;

globalSettings.sys.localaddress = ip.address() +':'+ port;
globalSettings.data.localaddress = globalSettings.sys.localaddress;

var default_security_level = "Code green - All clear";


/* DYNAMIC DATA: data die bij setup worden gebruikt en constant kunnen worden aangepast. */
var dynamicData = {
  countClients  : 0,
  alertLevel    : default_security_level,
  lastBC : "bcdefault",
  portalStatus : "ok"
}

/* ACTIVE DEVICE VARS */
var activeClients = [];
var deviceLabelArray = ['00.','FA.','A2.','63.','D4.','19.','C5.','D3.','81.','74.','5E.'];

/* INITIALISEN VAN APP */

app.use(express.static('public'));
app.use(express.static('_includes'));
/*app.use('_includes', express.static('public'));*/

/*app.use(bodyParser.urlencoded({ extended: true }));*/

/*
  NOTE TO SELF: SUB-APP: we kunnen blijkbaar meerdere domeinen/apps bouwen in dezelfde index.js ...
  bijvoorbeeld:
    var admapp = express();
    admapp.use(express.static('public'));
    admapp.use(express.static('_includes maar dan anders'));
  het potentieel hiervan moet ik nog vinden, maar _oei_
*/



http.listen(port, function(){

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

  eventLogger('INIT','Beacon succesfully started.');
});



/* pathing / routing */
app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/public/'});
});

app.get('/adm', function(req, res){
  res.sendFile('/adm/index.html', {"root": __dirname+'/public/'});
});


app.get('*', function(req, res){
  res.sendFile('404.html', {"root": __dirname+'/public/'});
});

io.on('connection', function (socket) {

  dynamicData['countClients'] = io.engine.clientsCount;

  activeClients[socket.id] = [];
  activeClients[socket.id]["id"] = socket.id;
  activeClients[socket.id]["name"] = (deviceLabelArray[Math.floor(Math.random() * deviceLabelArray.length)]) + (Math.round(100+(Math.random() * (999-100))));

  console.log('\t[CONN] '+dynamicData['countClients']+' active client(s).');

  setTimeout(function(){
    /* send FRONTEND data to FRONT */
    socket.emit('startConfig', globalSettings.data);
  },1000);

  /* experiment: Get the Device info & IP for logging. */
  /*socket.on('clientDevice', function(clientdata){

    var clientBrowser = "";
    if((clientdata.ua).indexOf("Chrome") > -1) {
        clientBrowser = "Google Chrome";
    } else if ((clientdata.ua).indexOf("Safari") > -1) {
        clientBrowser = "Apple Safari";
    } else if ((clientdata.ua).indexOf("Opera") > -1) {
        clientBrowser = "Opera";
    } else if ((clientdata.ua).indexOf("Firefox") > -1) {
        clientBrowser = "Mozilla Firefox";
    } else if ((clientdata.ua).indexOf("MSIE") > -1) {
        clientBrowser = "MS Internet Explorer";
    }

    console.log('\nI spy with my little eye:');

    console.log('- '+clientdata.ua);
    console.log('- '+device(clientdata.ua).type + ' // ' + clientdata.pf);
    console.log('- '+clientBrowser);
  });*/


  // CLEARALL :: reset sec status. COMMENTED: APPARANTLY UNUSED CODE.
  /*socket.on('ClearAll', function() {
    dynamicData['alertLevel'] = default_security_level;
    io.emit('updateDynamicData', dynamicData);

    console.log('[secLVL] level => reset');
    eventLogger('SEC','Security level reset \n');
  });*/

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

    delete activeClients[socket.id];

    dynamicData['countClients'] = io.engine.clientsCount;
    console.log('\t[D.C.]' +dynamicData['countClients']+' active client(s).');
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

  socket.on('broadcastAudio', function(audiofile){

    console.log('[audio] => file: '+ audiofile);

    io.emit('playAudioFile', audiofile);
    eventLogger('AUDIO','audio file sent: '+ audiofile +'. \n');
  });


  /* PAK ALLE AUDIO EN PUSH DEZE NAAR DE OVERLORD */
  socket.on('getMedia', function(){

    var miscAudio = [];
    if(fs.existsSync('./public/sounds/audio-misc')) {
      fs.readdir('./public/sounds/audio-misc', (err, files) => {
        files.forEach(file => {
          miscAudio.push(file);
        });

        socket.emit('sendMediaMisc', miscAudio);
      });
    }


    var aliceAudio = [];
    if(fs.existsSync('./public/sounds/audio-alice')) {
      fs.readdir('./public/sounds/audio-alice', (err, files) => {
        files.forEach(file => {
          aliceAudio.push(file);
        });
        socket.emit('sendMediaAlice', aliceAudio);
      });
    }

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

function eventLogger(type, message) {

  var datum = new Date(), y = datum.getFullYear(), m = datum.getMonth();

  var logfile = 'LOGS/eventlog.txt';
  var printresult = "";

  if(!message || !type) {
    return false;
  } else {

    var currentTime = new Date();
    var currentHours   = currentTime.getHours ( );
    var currentMinutes = currentTime.getMinutes ( );
      currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
      currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
        currentTime = currentHours + ":" + currentMinutes;

        printresult += '[ ' + type + ' ]\t';
        printresult += datum.getDate() + '-' + datum.getMonth() + ', '+ currentTime;
        printresult += '\t:: ';
        printresult += message + '\n';

        fs.appendFile(logfile, printresult, function(err) {
          if(err) throw err;
        });
  }

}
