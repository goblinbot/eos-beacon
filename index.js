/* dependancies verklaren en ophalen */
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var $       = require('jquery');
var ip      = require('ip');
var bodyParser = require('body-parser');
var session = require('client-sessions');


/* CONFIGURATIE: vaste gegevens bij start up. */
var port          = process.env.PORT || 5001;
var globalSettings = {
  appnaam1      : 'BEACON',
  appdescription: '/ EOS BASTION INFORMATION SERVICE',
  localaddress  : ip.address() +':'+ port,
}
var default_security_level = "Code green - All clear";
var default_sound_setting = 2;

/* DYNAMIC DATA: data die bij setup worden gebruikt en constant kunnen worden aangepast. */
var dynamicData = {
  countClients  : 0,
  alertLevel    : default_security_level,
  soundsEnabled : default_sound_setting
}

/* ACTIVE DEVICE VARS */
var activeClients = [];
var deviceLabelArray = ['00.','FA.','A2.','63.','D4.','19.','C5.','D3.','81.'];

/* accounts */
var valid_logincodes = ['00451','12345','67890','07311'];

function accountObj(logincode,loginrank) {
  this.logincode = logincode;
  this.loginrank = loginrank;
}
var valid_accounts = [];
    valid_accounts[0] = (new accountObj('00451','4'));
    valid_accounts[1] = (new accountObj('07311','4'));
    valid_accounts[2] = (new accountObj('12345','3'));
    valid_accounts[3] = (new accountObj('67890','1'));

/* INITIALISEN VAN APP */

// connection.connect();

app.use(express.static('public'));
app.use(express.static('_includes'));
app.use('_includes', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

http.listen(port, function(){
  console.log('. ');
  console.log('. ');
  console.log('.. ');
  console.log('// '+globalSettings['appnaam1']+' ////////////');
  console.log('# Initialising ..' );
  console.log('# Loading dependancies ..');
  console.log('-------------------------');
  console.log('# CONNECT DEVICES//USERS TO :');
  console.log(' ? External IP : ' + globalSettings['localaddress'] );
  console.log(' ? Internal IP : localhost:'+ port  + ' | ' + '127.0.0.1:'+ port );
  console.log('-------------------------');
  console.log('THANK YOU FOR USING '+globalSettings['appnaam1']+' INFORMATION & BROADCASTING SERVICES');
});



/* pathing / routing */
app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/public/'});
});

io.on('connection', function (socket) {

  dynamicData['countClients']++;


  activeClients[socket.id] = [];
  activeClients[socket.id]["id"] = socket.id;



  activeClients[socket.id]["name"] = (deviceLabelArray[Math.floor(Math.random() * deviceLabelArray.length)]) + (Math.round(100+(Math.random() * (999-100))));

  console.log(activeClients);



  console.log('Device connected. '+dynamicData['countClients']+' active clients.');

  // stuurt IP naar de index pagina zodat deze bovenin kan worden laten zien.
  // socket.emit('showIP', 'IP: ' + localaddress);

  // io.to(lastID).emit('F5');

  setTimeout(function(){
    socket.emit('startConfig', globalSettings);
  },500);


  // CLEARALL :: reset sec status.
  socket.on('ClearAll', function() {
    dynamicData['alertLevel'] = default_security_level;
    io.emit('updateDynamicData', dynamicData);
  });

  socket.on('updateSecurity', function(secLevel){
    var outString = secLevel.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['alertLevel'] = outString;
    io.emit('updateDynamicData', dynamicData);
  });

  socket.on('setSoundSetting', function(option){
    var option = option.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    dynamicData['soundsEnabled'] = option;
    io.emit('updateDynamicData', dynamicData);
  });

  // FORCE RESET ::
  socket.on('forceReset', function() {
    io.emit('F5');
  });

  // chat bericht
    // socket.on('sendChatMessage', function(message) {
    //
    //   message[0] = message[0].replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    //   message[1] = message[1].replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
    //
    //   io.emit('globalChatMessage',message);
    //
    // });


  socket.on('requestDynamicData', function (){
    io.emit('updateDynamicData', dynamicData);
  });


  socket.on('broadcastSend', function(value){
    console.log(value);
    io.emit('broadcastReceive', value);
  });

  socket.on('disconnect', function(){

    delete activeClients[socket.id];
    console.log(activeClients);

    dynamicData['countClients'] = (dynamicData['countClients']-1);
    console.log('DISCONNECT// .. ' +dynamicData['countClients']+' active clients.');
    io.emit('updateDynamicData', dynamicData );
  });


  // socket.on('auth', function(keycode){
  //   var checklogincode = 0;
  //   console.log('authentication code received: '+keycode);
  //
  //   for (var i in valid_logincodes) {
  //     if(valid_logincodes[i] == keycode) {
  //       checklogincode = 1;
  //     }
  //   }
  //
  //   if(checklogincode == 1) {
  //     socket.emit('authTrue', keycode);
  //   } else {
  //     socket.emit('authFalse');
  //   }
  // });
  socket.on('auth', function(keycode){
    var checklogincode = 0;
    var loginrank = 0;
    console.log('authentication code received: '+keycode);

    for (var i in valid_accounts) {

      if(valid_accounts[i].logincode == keycode) {
        checklogincode = 1;
        console.log(valid_accounts[i]);
        loginrank = valid_accounts[i].loginrank;
      }
    }

    if(checklogincode == 1) {
      socket.emit('authTrue', keycode, loginrank);
    } else {
      socket.emit('authFalse');
    }
  });

});
