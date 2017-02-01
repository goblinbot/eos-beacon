/* dependancies verklaren en ophalen */ 
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var $       = require('jquery');
var bodyParser = require('body-parser');

/* data */
var countClients = 0;



/* INITIALISEN VAN BEACON */
// connection.connect();

app.use(express.static('public'));
app.use(express.static('_includes'));
app.use('_includes', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 5000;
http.listen(port, function(){
  console.log('Activity detected on pathway *:'+ port +'. Standing by.');
});



/* pathing / routing */
app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname+'/public/'});
});
