/* dependancies verklaren en ophalen */
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var $       = require('jquery');
var ip      = require('ip');
var bodyParser = require('body-parser');

/* data */
var port          = process.env.PORT || 5000;
var countClients  = 0;
var localaddress  = ip.address() +':'+ port;

var appnaam1      = 'BEACON';
var appnaam2      = 'beacon';
var appnaam3      = 'Beacon';


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
  console.log('// '+appnaam1+' ////////////');
  console.log('# Initialising ..' );
  console.log('# Loading dependancies ..');
  console.log('-------------------------');
  console.log('# CONNECT DEVICES//USERS TO :');
  console.log(' ? External IP : ' + localaddress );
  console.log(' ? Internal IP : localhost:'+ port + ' | ' + '127.0.0.1:'+ port );
  console.log('-------------------------');
  console.log('THANK YOU FOR USING '+appnaam1+' INFORMATION & BROADCASTING SERVICES');
});



/* pathing / routing */
app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/public/'});
});


io.on('connection', function (socket) {

  countClients++;
  console.log('Device connected. '+countClients+' active clients.');

  // stuurt IP naar de index pagina zodat deze bovenin kan worden laten zien.
  socket.emit('showIP', 'IP: ' + localaddress);




  socket.on('broadcastSend', function(value){
    console.log(value);
    socket.emit('broadcastReceive', value);
  });

  socket.on('disconnect', function(){
    countClients = (countClients-1);
    console.log('DISCONNECT// .. ' +countClients+' active clients.');
  });

});
