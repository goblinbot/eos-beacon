const socket = io();
var selector = "";
var target = "";
var clearIsActive = undefined;
var activeColorScheme = '0';
var activeBroadcastPriority = 1;

/* VARS FOR CACHING: We fill these variables with $(html) selectors to save memory in the long run. */
var clockCache = "";
var ddCache = "";
var dowCache = "";
var BCaudioCache = "";
var customAudioCache = "";
var notifiContCache = "";

/* navigate loads (TARGET).HTML into the MAIN SCREEN div. pretending to go to another page but instead putting it into our existing box.*/
function navigate(target) {
  if(target != "") {
    $('#main').empty().load(target+'.html');
  }
}

/* flashblocks causes a "flash" effect inside the boxes spread over beacon, when for example, a broadcast is received.
this flash should only lasts for a few seconds, by calling the FlashBlocks function again with a small timeout. */
function FlashBlocks(div) {

  if(div == "" || div == undefined) {
    div = '.block';
  }

  /* don't flash mobile devices. */
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

/* function: broadcast . CLIENT SIDE. This is triggered upon RECEIVING a broadcast from the server (index.js) */
function broadCast(location) {

  /* fills in the blanks. */
  if(location['title'] == null) location['title'] = "Untitled Broadcast";
  if(location['file'] == null) location['file'] = "404";
  if(location['priority'] == null) location['priority'] = "1";
  if(location['duration'] == null) location['duration'] = "0";
  if(location['colorscheme'] == null) location['colorscheme'] = "0";


  /* checks if anything is set in the broadcast call. */
  /*if(location) {*/

    /* Cache the notification container div: This will save us a LOT of requests in the long run. */
    if(notifiContCache == "") { notifiContCache = $("#notificationContainer");}

    var currentTimeString = getCurrentTime();

    /* weird little optimazation: let the flash function inside our house,
      so we don't end up calling it inside two to four times and then pushing them outside again */
    var FlashFunctie = FlashBlocks;

    /* Hey, I just noticed you loaded a broadcast.HTML file there, let me just.. */
    $.get('/broadcasts/'+location['file']+'.html')
      .done(function(){

        if(location['priority'] > 0 && !isNaN(location['duration'])) {

          if(location['priority'] < activeBroadcastPriority) {

            return false;

          } else {

            /* if video player exists; kill it, dispose of the body. */
            if($('#broadcastVideo').length > 0 ) {
              var oldPlayer = document.getElementById('broadcastVideo');
              videojs(oldPlayer).dispose();
            }

            /* foolproofing: if the color scheme is named DEFAULT instead of zero, make it zero regardless. */
            if(location.colorscheme == 'default') location.colorscheme = '0';
            if(activeColorScheme == 'default') activeColorScheme = '0';

            /* while we're at it, let's check for scary symbols. Just incase. */
            var outString = location.colorscheme.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
            location.colorscheme = outString;

            /* colorscheme. */
            /* is the colorscheme already active, OR is default trying to override default? */
            if((activeColorScheme == '0' && location.colorscheme == '0') || (activeColorScheme == location.colorscheme)) {
              /* no change..*/

            } else if (activeColorScheme != '0'  && location.colorscheme == '0') {
              /* unload the previous colorscheme. Then, load.. */
              $('link[rel=stylesheet][href~="/_includes/css/alert-'+activeColorScheme+'.css"]').remove();
              activeColorScheme = '0';

            /* active = default > broadcast = not-default: */
            } else if (activeColorScheme == '0' && location.colorscheme != '0') {

              $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', '/_includes/css/alert-'+location.colorscheme+'.css') );
              activeColorScheme = location.colorscheme;

            } else if (location.colorscheme != '0' && activeColorScheme != location.colorscheme) {

              /* unload ACTIVE, load LOCATION */
              $('link[rel=stylesheet][href~="/_includes/css/alert-'+activeColorScheme+'.css"]').remove();
              $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', '/_includes/css/alert-'+location.colorscheme+'.css') );
              activeColorScheme = location.colorscheme;
            }

            /* empty the container, then, load the new broadcast. */
            notifiContCache.empty().load('/broadcasts/'+location.file+'.html');


              /* resets priority 99 to 1, so that it can later be overruled. Because 99 equals RESET. */
              if(location.priority == 99) location.priority = 1;

              /* update 'Last broadcast' */
              activeBroadcastPriority = location.priority;

              if(location.title != "") {

                var outString = location.title.replace(/[`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\\/]/gi, '');
                location.title = outString;

                $("#lastBroadcastTitle").html("<i class='fa fa-bell'></i>&nbsp;" + location.title);
                $("#lastBroadcastTime").html(currentTimeString);
              }

              /* set the clearBroadcast to ZERO. This prevents a PREVIOUS broadcast reset from triggering on your new broadcast. */
              if(location.duration && location.duration == 0) {
                clearBroadcast(0);
              }

              /* request a 'CLEAR IN XXXX MILISECONDS' */
              if(location.duration && location.duration > 0 && !isNaN(location.duration)) {
                clearBroadcast(location.duration);
              }

            FlashFunctie('.block');
            setTimeout(function(){
              FlashFunctie('.block');
            },1500);
          }
        }
      })
    .fail(function(){

      /* INCASE the broadcast IS NOT loaded (for example, an error or a file truly doesnt exist), CLEAR the changes and load 404. */

      if(activeColorScheme != '0' && activeColorScheme != 'default') {
        $('link[rel=stylesheet][href~="/_includes/css/colors-'+activeColorScheme+'.css"]').remove();
      }

      FlashFunctie('.block');
      setTimeout(function(){
        FlashFunctie('.block');
      },1500);

      activeColorScheme = '0';
      activeBroadcastPriority = 1;

      notifiContCache.empty().load('/broadcasts/404.html');
    });
  /*}*/

}

/* SEND THE BROADCAST. This is usually put on buttons, but you can use it from the console when you want to. Or anywhere else, really. */
function sendBroadCast(location) {

  var FlashFunctie = FlashBlocks;

  FlashFunctie('.adm-tab');
  setTimeout(function(){
    FlashFunctie('.adm-tab');
  },1500);

  socket.emit('broadcastSend',location);
}


/* functie om de duration toch wel werkend te krijgen - oftewel een broadcast CLEAREN na ingestelde tijd.*/
function clearBroadcast(duration){
  console.log('clear in :' + duration);

  if(duration != "" && duration != null) {

    /* timer? Gebruik die mooie timer en DAN resetten we de broadcast.*/
    if(clearIsActive != undefined && duration > 0) {
      console.log('clear == active');
      clearTimeout(clearIsActive);
      clearIsActive = setTimeout(function(){
        socket.emit('broadcastSend', bcreset);
        clearIsActive = undefined;
      },duration);

    } else if (clearIsActive != undefined && duration == 0) {
      console.log('clear == nullified');
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    } else if (undefined && duration == 0) {

      /* niks doen. */

    } else {
      clearIsActive = setTimeout(function(){
        socket.emit('broadcastSend', bcreset);
        clearIsActive = undefined;
      },duration);
    }

  } else {

    if(duration === 0) {
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    } else {
      /* geen timer? Gewoon resetten. */
      socket.emit('broadcastSend', bcreset);
      clearTimeout(clearIsActive);
      clearIsActive = undefined;
    }

  }

}

function generateAudioPlayer(audiofile, repeatcount) {

  if(customAudioCache == "") {
    customAudioCache = $('#custom-audio');
  }

  if(audiofile) {

    console.log(audiofile);

    if(repeatcount == null || repeatcount == undefined) {
      repeatcount = 1;
    }

    if(document.getElementById("custom-audio") !== null) {

      console.log('CUSTOM-audio -> play: ' + audiofile + ' * ' + repeatcount + ' time(s). ');

      if ($(window).width() > 960) {
        customAudioCache.empty().html('<audio id="generatedaudioplayer" controls="controls" class="hidden">'
        + '<source src="/sounds/'+ audiofile +'" type="audio/mpeg">'
        +'</audio>');

        $('#generatedaudioplayer').trigger('play');

        /* repeat? */

      }

    } else {

      if(document.getElementById("default-audio") !== null) {
        console.log('default-audio -> play');

        customAudioCache.empty();
        $('#default-audio').trigger('play');

      }

    }

  } else {

    customAudioCache.empty();
    $('#default-audio').trigger('play');
  }

}

/* audio file functie apart */
function generateBCaudio(audiofile) {

  console.log(audiofile);

  if ($(window).width() > 960) {

    /* cache the audio element if we haven't already. */
    if(BCaudioCache == "") { BCaudioCache = $('#BCAUDIO'); }

    /* empty element, and refill it with the new audio. */
    BCaudioCache.empty().html('<audio id="generatedBCAUDIO" controls="controls" class="hidden">'
    + '<source src="/sounds'+ audiofile +'">'
    +'</audio>');

    /* don't cache this selector, as it keeps being reborn. */
    $('#generatedBCAUDIO').trigger('play');

  }
}



/* portal status. */
function updatePortalStatus(portalstatus) {

  /* cache the portal status selector here, so that we only have to find it once before running the rest. */
  var portalStatusSelector = $('#portalstatus');

  /* remove animation class, just in case. */
  portalStatusSelector.removeClass('blinkContent');

  if(portalStatusSelector.html() != "" && portalstatus != "" && portalstatus != null) {

    /* switches the portal status between a few select options. Adds 'blinkContent' if the element needs to be animated. */
    if(portalstatus == "unstable") {

      portalStatusSelector.find('.left').html('<span class="portalstatus-icon"><i class="fa fa-angle-double-down"></i></span>');
      portalStatusSelector.find('.right h4').html('Connectivity issues');
      portalStatusSelector.find('.right p').html('Portal network unstable. Package loss may occur.');

    } else if(portalstatus == "multirequest") {

      portalStatusSelector.addClass('blinkContent').find('.left').html('<span class="portalstatus-icon"><i class="fa fa-warning"></i></span>');
      portalStatusSelector.find('.right').find('h4').html('Multiple requests');
      portalStatusSelector.find('.right').find('p').html('Multiple external requests detected.<br/>Please stand by.');

    } else if (portalstatus == "shutdown") {

      portalStatusSelector.addClass('blinkContent').find('.left').html('<span class="portalstatus-icon"><i class="fa fa-warning"></i></span>');
      portalStatusSelector.find('.right').find('h4').html('!! OFFLINE !!');
      portalStatusSelector.find('.right').find('p').html('Portal services currently unavailable.');

    } else if (portalstatus == "active") {

      portalStatusSelector.addClass('blinkContent').find('.left').html('<span class="portalstatus-icon"><i class="fa fa-cog fa-spin"></i></span>');
      portalStatusSelector.find('.right').find('h4').html('Active');
      portalStatusSelector.find('.right').find('p').html('Portal activity detected ...');

    } else if (portalstatus == "maintenance") {

      portalStatusSelector.addClass('blinkContent').find('.left').html('<span class="portalstatus-icon"><i class="fa fa-info-circle"></i></span>');
      portalStatusSelector.find('.right').find('h4').html('Maintenance Required');
      portalStatusSelector.find('.right').find('p').html('Safety first.');

    } else {

      portalStatusSelector.find('.left').html('<span class="portalstatus-icon"><i class="fa fa-check-circle-o"></i></span>');
      portalStatusSelector.find('.right').find('h4').html('Operational');
      portalStatusSelector.find('.right').find('p').html('Nothing to report.');

    }
  }
}

/* When changing the portal status, play a tune. Or don't, in the case of most mobile devices. */
function playPortalAudio() {
  if($(window).width() > 769) {
    $('#portalaudio').trigger('play');
  }
}

/* function to create a video player on devices with enough screen width. */
function generateVideo(name, type) {

  if($(window).width() > 768) {

    $('#video-container').html('<video id="broadcastVideo" class="video-js" controls preload="auto"><source src="/video/'+name+'" type="video/'+type+'"></source></video>');

      /* ask videojs to turn our video element into a tuned up video element. */
      videojs("broadcastVideo", {"controls": true, "autoplay": true, "preload": "auto"}, function(){});

  } else {

    /* client's screen is too small, put on a fallback instead. */
    $('#video-container').html(
      '<div class=\"container-fluid\">'
      + '<h2>Broadcast:Transmission</h2>'
      + '<p>Video tranmission is currently playing on compatible/certified devices.</p>'
      + '<br/>'
      + '<div class=\"animloadbar\">'
      +   '<span class=\"animloadbar-bar\"></span>'
      + '</div>'
      +'</div>'
    );

  }

}


/* CLOCK */
function updateClock() {
  var dow;
	var currentTime = new Date();
    var dd = currentTime.getDate();
    /*var mm = currentTime.getMonth()+1;*/ /*January is 0!*/
    /* var dow = currenTime.prototype.getDay();*/
    if(dd < 10){
      dd='0'+dd;
    }

    if (dd == 30) {
      dd    = '27';
      dow   = 'FRIDAY';
    } else if (dd == 01) {
      dd    = '28';
      dow   = 'SATURDAY';
    } else if (dd == 02) {
      dd    = '29';
      dow   = 'SUNDAY';
    } else {
      dd    = '27';
      dow   = 'FRIDAY';
    }

  	var currentHours   = currentTime.getHours ( );
  	var currentMinutes = currentTime.getMinutes ( );
  	var currentSeconds = currentTime.getSeconds ( );

  	/* Pad the minutes and seconds with leading zeros, if required */
    currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
  	currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  	currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

  	/* Compose the string for display */
  	var currentTimeString ="[&nbsp;" + currentHours + ":" + currentMinutes + ":" + currentSeconds + "&nbsp;ECT&nbsp;]";

    /* put the target HTML elements into a var we can keep reusing; that way the function will only need to look up each element ONCE. */
    if(clockCache == ""){ clockCache = $("#clock"); }
    if(ddCache == ""){ ddCache = $("#dd"); }
    if(dowCache == ""){ dowCache = $("#dow"); }

    /* apply clock to cached element. */
    clockCache.html(currentTimeString);
    ddCache.html(dd);
    dowCache.html(dow);

 }
