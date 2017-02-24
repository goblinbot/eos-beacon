var socket      = io();
var selector    = "";
var target      = "";
var navLimit    = 0;
var activeColorScheme = '0';

// BROADCAST OBJECTEN
// constructor:
function broadcastObj(title, file, priority, duration, colorscheme) {
  this.title        = title;
  this.file         = file;
  this.priority     = priority;
  this.duration     = duration; // LET OP : DURATION WORD NIET GEBRUIKT.
  this.colorscheme  = colorscheme;
}

// PRE-SET broadcasts!
var defaultBroadcast  = new broadcastObj("Broadcast Initialise","standby","1","0","0");
var testBroadcast     = new broadcastObj(":: TESTING BROADCAST ::","test","1","2000","0");
var resetBroadcast    = new broadcastObj("Clear","standby","10","0","0");


var hazardBroadcast       = new broadcastObj("Envirnomental Hazard detected","biohazard","8","0","1");
var psyWarningBroadcast   = new broadcastObj("Psy-hazard detected","psyhazard","8","0","1");


// einde pre-sets

// deze word overschreven door de laatste broadcast
var activeBroadcast   = new broadcastObj("-","-","1","0","0");


// navigeerd - een functie geerft uit www.gubat.nl, word eigenlijk maar eenmaal
// gebruikt om MAINSCREEN.HTML in te laden maar kan gebruikt worden.
function navigate(target) {
  if(target != "") {
    $('#main').load(target+'.html');
  }
}

// stuurt 'TEST' op commando op alle verbonden clients.
function broadCastTest() {
  // broadCast(testBroadcast);
  socket.emit('broadcastSend',testBroadcast);
}

function FlashBlocks() {

  if($(window).width() < 769) {
    return false;
  }

  if( $('.block').hasClass('flash') ) {
    $('.block').removeClass('flash');
  } else {
    $('.block').addClass('flash');
  }
}

// function: broadcast . CLIENT SIDE.
function broadCast(location) {

  if(location['title'] == null)         {   location['title'] = "Untitled Broadcast" }
  if(location['file'] == null)          {   location['file'] = "404"      }
  if(location['priority'] == null)      {   location['priority'] = "1"    }
  if(location['duration'] == null)      {   location['duration'] = "0"    }
  if(location['colorscheme'] == null)   {   location['colorscheme'] = "0" }

  // update de laatst activeBroadcast naar de ontvange 'location'
  activeBroadcast = new broadcastObj(location['title'],location['file'],location['priority'],location['duration'],location['colorscheme']);
  // stuurt de nieuwste hier naar de backend.
  socket.emit('changeActiveBroadcast',activeBroadcast);

  // console.log('active: '+ activeBroadcast['title']);

  if(location) {

    navLimit = (navLimit+1);

    /* maakt een timestamp zoals bij de clock update, maar korter. */
    var currentTime = new Date();
    var currentHours   = currentTime.getHours ( );
    var currentMinutes = currentTime.getMinutes ( );
    currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
    currentHours = ( currentHours == 0 ) ? 12 : currentHours;
    var currentTimeString = currentHours + ":" + currentMinutes + ":" + "&nbsp;ECT";

    /* update 'Last broadcast' */
    if(location['title'] != "" && location['title'] != "Clear") {
      $("#lastBroadcastTitle").html("<i class='glyphicon glyphicon-bell'></i>&nbsp;" + location['title']);
      $("#lastBroadcastTime").html(currentTimeString);
    }

    $.get('/broadcasts/'+location['file']+'.html')
      .done(function(){

        if(location['priority'] > 0 && !isNaN(location['duration'])) {
          if(location['priority'] < activeBroadcast['priority']) {
            return false;
          } else {
            $("#notificationContainer").empty();
              $('#notificationContainer').load('/broadcasts/'+location['file']+'.html');

              /* kleurenschema. */
              /* default probeerd default te worden, OF de colorschemes zijn gelijk? */
              if((activeColorScheme == '0' && location['colorscheme'] == '0') || (activeColorScheme == location['colorscheme'])) {
                /* verander niks .*/

              } else if (activeColorScheme != '0'  && location['colorscheme'] == '0') {
                /* UNLOAD DE VORIGE COLORSCHEME, VERVOLGENS: */
                /**/
                activeColorScheme = '0';

              /* actief = default > broadcast = niet-default: */
              } else if (activeColorScheme == '0' && location['colorscheme'] != '0') {

                /* inladen die zooi. */
                activeColorScheme = location['colorscheme'];

              } else if (location['colorscheme'] != '0' && activeColorScheme != location['colorscheme']) {

                /* laad ACTIVE uit, laad LOCATION in */
                activeColorScheme = location['colorscheme'];
              }
              

              if(location['duration'] && location['duration'] > 0 && !isNaN(location['duration'])) {
                console.log(location['duration']);
                clearBroadcast(location['duration']);
              }

              FlashBlocks();
              setTimeout(function(){
                FlashBlocks();
              },1200);
          }
        }
      })
      .fail(function(){
        $("#notificationContainer").empty();
          $("#notificationContainer").load('/broadcasts/404.html');
      });
  }

}

// VERSTUURD DE BROADCAST: kleine hack om vanaf de admin op knop een alert te kunnen posten.
function sendBroadCast(location) {
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

  if(duration != "" && duration != null) {
    // timer? Gebruik die mooie timer en DAN resetten we de broadcast.
    setTimeout(function(){
      socket.emit('broadcastSend', resetBroadcast);
    },duration);

  } else {
    // geen timer? Gewoon resetten.
    socket.emit('broadcastSend', resetBroadcast);
  }

}

// CLOCK //////////////////////////////////////////////////////
function updateClock() {
	var currentTime = new Date();
    var dd = currentTime.getDate();
    var mm = currentTime.getMonth()+1; //January is 0!
    // var dow = currenTime.prototype.getDay();
    if(dd < 10){
      dd='0'+dd;
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
    // $("#dow").html(dow);
 }
 $(document).ready(function() {
    setInterval('updateClock()', 1000);
 });
