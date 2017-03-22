var socket      = io();
var selector    = "";
var target      = "";
var navLimit    = 0;
var clearIsActive = undefined;
var activeColorScheme = '0';
var activeBroadcast   = 1;


// navigeerd - een functie geerft uit www.gubat.nl, word eigenlijk maar eenmaal
// gebruikt om MAINSCREEN.HTML in te laden maar kan gebruikt worden.
function navigate(target) {
  if(target != "") {
    $('#main').load(target+'.html');
  }
}

function FlashBlocks(div) {

  if(div == "" || div == undefined) {
    div = '.block';
  }

  if($(window).width() < 769) {
    return false;
  }

  if( $(div).hasClass('flash') ) {
    $(div).removeClass('flash');
  } else {
    $(div).addClass('flash');
  }
}

function getCurrentTime() {
  var currentTime = new Date();
  var currentHours   = currentTime.getHours ( );
  var currentMinutes = currentTime.getMinutes ( );
  currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  currentHours = ( currentHours == 0 ) ? 12 : currentHours;
  var currentTimeString = currentHours + ":" + currentMinutes + ":" + "&nbsp;ECT";
  return currentTimeString;
}

// function: broadcast . CLIENT SIDE.
function broadCast(location) {

  if(location['title'] == null)         {   location['title'] = "Untitled Broadcast" }
  if(location['file'] == null)          {   location['file'] = "404"      }
  if(location['priority'] == null)      {   location['priority'] = "1"    }
  if(location['duration'] == null)      {   location['duration'] = "0"    }
  if(location['colorscheme'] == null)   {   location['colorscheme'] = "0" }

  // console.log('active: '+ activeBroadcast['title']);

  if(location) {

    navLimit = (navLimit+1);

    var currentTimeString = getCurrentTime();

    $.get('/broadcasts/'+location['file']+'.html')
      .done(function(){

        if(location['priority'] > 0 && !isNaN(location['duration'])) {

          if(location['priority'] < activeBroadcast) {

            return false;

          } else {

            /* foolproof controle: als DEFAULT word opgegeven telt hij ook als '0' */
            if(location['colorscheme']  == 'default') { location['colorscheme'] = '0'; }
            if(activeColorScheme        == 'default') { activeColorScheme       = '0'; }

            var outString = location['colorscheme'].replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
            location['colorscheme'] = outString;

            /* kleurenschema. */
            /* default probeerd default te worden, OF de colorschemes zijn gelijk? */
            if((activeColorScheme == '0' && location['colorscheme'] == '0') || (activeColorScheme == location['colorscheme'])) {
              /* verander niks .*/

            } else if (activeColorScheme != '0'  && location['colorscheme'] == '0') {
              /* UNLOAD DE VORIGE COLORSCHEME, VERVOLGENS: */
              $('link[rel=stylesheet][href~="/_includes/css/colors-'+activeColorScheme+'.css"]').remove();
              activeColorScheme = '0';

            /* actief = default > broadcast = niet-default: */
            } else if (activeColorScheme == '0' && location['colorscheme'] != '0') {

              $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', '/_includes/css/colors-'+location['colorscheme']+'.css') );
              activeColorScheme = location['colorscheme'];

            } else if (location['colorscheme'] != '0' && activeColorScheme != location['colorscheme']) {

              /* laad ACTIVE uit, laad LOCATION in */
              $('link[rel=stylesheet][href~="/_includes/css/colors-'+activeColorScheme+'.css"]').remove();
              $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', '/_includes/css/colors-'+location['colorscheme']+'.css') );
              activeColorScheme = location['colorscheme'];
            }



            $("#notificationContainer").empty();
              $('#notificationContainer').load('/broadcasts/'+location['file']+'.html');

              if(location['file'] !== 'standby') {
                var soundSetting = $('#dynamicSoundSetting').html();
                console.log('SOUND: '+soundSetting);
                if(soundSetting && soundSetting > 0) {
                  if ($('.extra-audio').html() == false || $('.extra-audio').html() == null) {
                    $('#default-audio').trigger('play');
                  }/* else {
                    $('.extra-audio').trigger('play');
                  }
                } else if (soundSetting && soundSetting == 1) {
                */
                }


              }


              //* reset de CLEAR naar 1 zodat hij overschrijfbaar is. */
              if(location['priority'] == 99) { location['priority'] = 1; }
              /* update 'Last broadcast' */
              activeBroadcast = location['priority'];

              if(location['title'] != "" /*&& location['title'] != "Clear"*/) {

                var outString = location['title'].replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
                location['title'] = outString;

                $("#lastBroadcastTitle").html("<i class='glyphicon glyphicon-bell'></i>&nbsp;" + location['title']);
                $("#lastBroadcastTime").html(currentTimeString);
              }

              if(location['duration'] && location['duration'] == 0) {
                /*if(clearIsActive != undefined) {
                  clearTimeout('clearIsActive');
                }*/
                clearBroadcast(0);
              }

              if(location['duration'] && location['duration'] > 0 && !isNaN(location['duration'])) {
                console.log(location['duration']);
                clearBroadcast(location['duration']);
              }

            FlashBlocks('.block');
            setTimeout(function(){
              FlashBlocks('.block');
            },1200);
          }
        }
      })
    .fail(function(){
      if(activeColorScheme != '0' && activeColorScheme != 'default') {
        $('link[rel=stylesheet][href~="/_includes/css/colors-'+activeColorScheme+'.css"]').remove();
      }

      FlashBlocks('.block');
      setTimeout(function(){
        FlashBlocks('.block');
      },1200);

      activeColorScheme   = '0';
      activeBroadcast     = 1;

      $("#notificationContainer").empty();
        $("#notificationContainer").load('/broadcasts/404.html');
    });
  }

}

// VERSTUURD DE BROADCAST: kleine hack om vanaf de admin op knop een alert te kunnen posten.
function sendBroadCast(location) {
  FlashBlocks('.adm-tab');
  setTimeout(function(){
    FlashBlocks('.adm-tab');
  },1200);
  socket.emit('broadcastSend',location);
}


// maakt de footer blokken equally groot aan de eerste.
function updateFooter() {
  if($(window).width() < 769) {
    return false;
  }
  $(".item").height($('#firstFooterBlock').height());
}

// functie om de duration toch wel werkend te krijgen - oftewel een broadcast CLEAREN na ingestelde tijd.
function clearBroadcast(duration){
  console.log('clear in :' + duration);

  if(duration != "" && duration != null) {

    // timer? Gebruik die mooie timer en DAN resetten we de broadcast.
    if(clearIsActive != undefined && duration > 0) {
      console.log('clear == actief');
      clearTimeout(clearIsActive);
      clearIsActive = setTimeout(function(){
        socket.emit('broadcastSend', resetBroadcast);
        clearIsActive = undefined;
      },duration);

    } else if (clearIsActive != undefined && duration == 0) {
      console.log('clear == nullified');
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    } else if (undefined && duration == 0) {

      // niks !

    } else {
      clearIsActive = setTimeout(function(){
        socket.emit('broadcastSend', resetBroadcast);
        clearIsActive = undefined;
      },duration);
    }

  } else {

    if(duration === 0) {
      console.log('raakvlak 3 ' + duration);
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    } else {
      // geen timer? Gewoon resetten.
      socket.emit('broadcastSend', resetBroadcast);
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    }



  }

}

// CLOCK //////////////////////////////////////////////////////
function updateClock() {
  var dow;
	var currentTime = new Date();
    var dd = currentTime.getDate();
    var mm = currentTime.getMonth()+2; //January is 0!
    // var dow = currenTime.prototype.getDay();
    if(dd < 10){
      dd='0'+dd;
    }

    if (dd == 24) {
      dd    = '01';
      dow   = 'FRIDAY';
    } else if (dd == 25) {
      dd    = '02';
      dow   = 'SATURDAY';
    } else if (dd == 26) {
      dd    = '03';
      dow   = 'SUNDAY';
    } else {
      dd    = '01';
      dow   = 'FRIDAY';
    }

  	var currentHours   = currentTime.getHours ( );
  	var currentMinutes = currentTime.getMinutes ( );
  	var currentSeconds = currentTime.getSeconds ( );

  	/* Pad the minutes and seconds with leading zeros, if required */
  	currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  	currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

  	/* Convert an hours component of "0" to "12" */
  	currentHours = ( currentHours == 0 ) ? 12 : currentHours;

  	/* Compose the string for display */
  	var currentTimeString ="[&nbsp;" + currentHours + ":" + currentMinutes + ":" + currentSeconds + "&nbsp;ECT&nbsp;]";

   	$("#clock").html(currentTimeString);
    $("#dd").html(dd);
    $("#dow").html(dow);

    // $("#dow").html(dow);
 }
 $(document).ready(function() {
    setInterval('updateClock()', 1000);
 });
