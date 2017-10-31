/* dependancies verklaren en ophalen */
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var $       = require('jquery');
var ip      = require('ip');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var fs = require('fs');




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
app.use('_includes', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

http.listen(port, function(){
  console.log('. ');
  console.log('. ');
  console.log('.. ');
  /*console.log(configtest.value);*/
  console.log('// '+globalSettings['cfg']['appname']+' ////////////');
  console.log('# Initialising ..' );
  console.log('# Loading dependancies ..');
  console.log('-------------------------');
  console.log('# CONNECT DEVICES//USERS TO :');
  console.log(' ? External IP : ' + globalSettings.sys['localaddress'] );
  console.log(' ? Internal IP : localhost:'+ port  + ' | ' + '127.0.0.1:'+ port );
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

  console.log('Device connected. '+dynamicData['countClients']+' active clients.');

  setTimeout(function(){
    /* send FRONTEND data to FRONT */
    socket.emit('startConfig', globalSettings.data);
  },1000);


  // CLEARALL :: reset sec status.
  socket.on('ClearAll', function() {
    dynamicData['alertLevel'] = default_security_level;
    io.emit('updateDynamicData', dynamicData);

    eventLogger('SEC','Security level reset');
  });

  socket.on('updateSecurity', function(input){
    var outString = input.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['alertLevel'] = outString;
    io.emit('updateDynamicData', dynamicData);

    eventLogger('SEC','Security level change => '+ input +'.');
  });
  socket.on('updatePortalStatus', function(input){
    var outString = input.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['portalStatus'] = input;
    io.emit('updateDynamicData', dynamicData);
    io.emit('portalfrontend');

    eventLogger('portal','Portal status change => '+ input +'.');
  });

  // FORCE RESET ::
  socket.on('forceReset', function() {
    dynamicData['lastBC'] = "bcdefault";
    io.emit('F5');

    eventLogger('admin','Force reset activated.',1);
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

    eventLogger('broadcast','sent: '+ value['title'] +'.');
  });

  socket.on('disconnect', function(){

    delete activeClients[socket.id];
    /*console.log(activeClients);*/

    dynamicData['countClients'] = io.engine.clientsCount;
    console.log('- Disconnected : ' +dynamicData['countClients']+' active clients.');
    io.emit('updateDynamicData', dynamicData );
  });

  socket.on('auth', function(keycode){
    var checklogincode = 0;
    var loginrank = 0;
    console.log('authentication code received: '+keycode);

    eventLogger('AUTH','auth-code received: '+ keycode +'.');

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
