/* dependancies verklaren en ophalen */
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ip = require('ip');
const fs = require('fs');
const globalSettings = require('./config.js');

/* CONFIGURATIE: vaste gegevens bij start up. */
const port = process.env.PORT || globalSettings.sys.port;

globalSettings.sys.localaddress = ip.address() + ':' + port;
globalSettings.data.localaddress = globalSettings.sys.localaddress;

const default_security_level = 'Code green - All clear';
const applicationState = {
  countClients: 0,
  alertLevel: default_security_level,
  lastBC: 'bcdefault',
  portalStatus: 'ok',
  orbStatus: 'active',
};

/* INITIALISING THE APP */

express.static.mime.define({ 'audio/ogg;codec=opus': ['opus'] });

app.use(express.static('public'));
app.use(express.static('_includes'));

// Init: FlavorText
http.listen(port, () => {
  console.log('\n..\n..');
  console.log('// ' + globalSettings['cfg']['appname'] + ' ////////////');
  console.log('# Initialising ..');
  console.log('# Loading dependancies ..');
  console.log('-------------------------');
  console.log('# CONNECT DEVICES//USERS TO :');
  console.log(' ? External IP :\n\t- ' + globalSettings.sys.localaddress);
  console.log(
    ' ? Internal IP :\n\t- localhost:' + port + '\n\t- ' + '127.0.0.1:' + port
  );
  console.log('-------------------------');
  console.log(
    'THANK YOU FOR USING ' +
    globalSettings.cfg.appname +
    ' INFORMATION & BROADCASTING SERVICES'
  );
});

/* pathing / routing */
app.get('/', (req, res) =>
  res.sendFile('index.html', { root: __dirname + '/public/' })
);
app.get('*', (req, res) =>
  res.sendFile('404.html', { root: __dirname + '/public/' })
);

const sanitizeUserString = (str) =>
  str.replace(/[`~$^&*_|=;'",<>\{\}\[\]\\\/]/gi, '');
const syncAppState = () => io.emit('updateDynamicData', applicationState);
const syncConnectionCounter = () => {
  applicationState.countClients = io.engine.clientsCount;
  syncAppState();
};

io.on('connection', (socket) => {
  syncConnectionCounter();
  console.log(`\t[IO] ${applicationState.countClients} active client(s).`);

  // initial configdata
  setTimeout(() => socket.emit('startConfig', globalSettings.data), 1000);

  socket.on('updateSecurity', (input) => {
    const _str = sanitizeUserString(input);
    applicationState['alertLevel'] = _str;
    syncAppState();
    console.log('[secLVL] level => ' + _str);
  });

  socket.on('updatePortalStatus', (input) => {
    const _str = sanitizeUserString(input);
    applicationState['portalStatus'] = _str;
    syncAppState();
    io.emit('portalfrontend');
    console.log('[portal] status => ' + _str);
  });

  socket.on('updateOrbStatus', (input) => {
    const _str = sanitizeUserString(input);
    applicationState.orbStatus = _str;
    syncAppState();
    io.emit('orbDivFlash');
    console.log('[orb] status => ' + _str);
  });

  // FORCE RESET ::
  socket.on('forceReset', () => {
    applicationState['lastBC'] = 'bcdefault';
    io.emit('F5');
    console.log('[admin] command => FORCE_RESET');
  });

  socket.on('requestDynamicData', () => syncConnectionCounter());

  socket.on('broadcastSend', (value) => {
    applicationState['lastBC'] = value.file;

    syncAppState();
    io.emit('broadcastReceive', value);

    if (value.duration > 1) {
      setTimeout(() => {
        applicationState.lastBC = 'bcdefault';
        console.log('=> last-bc timer cleared.');
      }, value.duration);
    }

    console.log('[broadcast] sent => ' + value['title']);
  });

  socket.on('disconnect', () => {
    console.log(`\t[IO] ${applicationState.countClients} active client(s).`);
    syncConnectionCounter();
  });

  socket.on('auth', (keycode) => {
    var checklogincode = 0;
    var loginrank = 0;

    for (var i in globalSettings.accounts) {
      if (globalSettings.accounts[i].logincode == keycode) {
        checklogincode = 1;
        loginrank = globalSettings.accounts[i].loginrank;
      }
    }

    if (checklogincode == 1) {
      console.log('(i) succesful auth using', keycode);
      socket.emit('authTrue', keycode, loginrank);
    } else {
      socket.emit('authFalse');
    }
  });

  /* broadcast from adminpanel to index.js. Sends a "play this file!" request to every connected client. */
  socket.on('broadcastAudio', (audiofile) => {
    console.log('[audio] => file: ' + audiofile);
    io.emit('playAudioFile', audiofile);
  });

  /* getMedia: function to automatically read audio files into pushable buttons, caused by the adminpanel when logging in with sufficient rights. */
  socket.on('getMedia', () => {
    /*
      getMedia has three seperate folders by default: miscAudio, aliceAudio and daveAudio.
      First, beacon will check if the subfolders actually exist, then read every file and push them into an array.
      Secondly, we push this array to the admin screen to generate the "play audio" buttons
    */
    var miscAudio = [];
    if (fs.existsSync('./public/sounds/audio-misc')) {
      fs.readdir('./public/sounds/audio-misc', (err, files) => {
        files.forEach((file) => {
          miscAudio.push(file);
        });
        socket.emit('sendMediaMisc', miscAudio);
      });
    }

    /* copy of misc audio */
    const aliceAudio = [];
    if (fs.existsSync('./public/sounds/audio-alice')) {
      fs.readdir('./public/sounds/audio-alice', (err, files) => {
        files.forEach((file) => aliceAudio.push(file));
        socket.emit('sendMediaAlice', aliceAudio);
      });
    }

    /* copy of misc audio */
    const daveAudio = [];
    if (fs.existsSync('./public/sounds/audio-dave')) {
      fs.readdir('./public/sounds/audio-dave', (err, files) => {
        files.forEach((file) => daveAudio.push(file));
        socket.emit('sendMediaDave', daveAudio);
      });
    }
  });

  var pa_name = null;
  var pa_folder = './public/sounds/audio-pa/';

  socket.on('startPA', function () {
    fs.readdir(pa_folder, function (err, files) {
      var cleantime = new Date(new Date().getTime() - 60000);
      if (err) {
        console.log('PA cleanup readdir error: ' + err);
      }
      files.forEach(function (file) {
        if (file) {
          var path = pa_folder + file;
          fs.stat(path, function (err, stat) {
            if (err) {
              console.log('PA cleanup stat error: ' + err);
            }
            if (stat.ctime < cleantime) {
              console.log('[PA] unlinking', path, stat.ctime, cleantime);
              fs.unlink(path, function (err) {
                if (err) {
                  console.log('PA cleanup unlink error: ' + err);
                }
              });
            }
          });
        }
      });
    });
    pa_name =
      'PA-' +
      socket.id +
      '-' +
      new Date().toISOString().substring(11, 23).replace(/[:.]/g, '');

    fs.mkdir(pa_folder, { recursive: true }, function (err) {
      if (err) throw err;
      fs.truncate(pa_folder + pa_name + '.opus', function (err) { });
    });
  });
  socket.on('uploadPA', function (data) {
    // TODO: Force maximum length to stop the server from overflowing
    fs.appendFile(pa_folder + pa_name + '.opus', data, function (err) {
      if (err) throw err;
    });
  });
  socket.on('broadcastPA', function () {
    console.log('[audio] => PA: ' + pa_name);
    io.emit('playAudioFile', '/audio-pa/' + pa_name + '.opus');
  });
});
