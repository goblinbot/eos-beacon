var socket      = io();
var selector    = "";
var target      = "";
var navLimit    = 0;

// BROADCAST OBJECTEN
// constructor:
function broadcastObj(title, file, priority, duration, colorscheme) {

  if(!title) {title = "Untitled Broadcast"}
  if(!file) {file = "404"}
  if(!priority) {priority = "1"}
  if(!duration) {duration = "0"}
  if(!colorscheme) {colorscheme = "0"}

  this.title    = title;
  this.fileName = file;
  this.priority = priority;
  this.duration = duration; // LET OP : DURATION WORD NIET GEBRUIKT.
  this.colorscheme = colorscheme;
}

// PRE-SET broadcasts!

var testBroadcast     = new broadcastObj(":: TESTING BROADCAST ::","test","1","2000","0");
var defaultBroadcast  = new broadcastObj("Broadcast Initialise","standby","1","0","0");
var activeBroadcast   = new broadcastObj("-","-","1","0","0");


// navigeerd - een functie geerft uit www.gubat.nl, word eigenlijk maar eenmaal
// gebruikt om MAINSCREEN.HTML in te laden maar kan gebruikt worden.
function navigate(target) {
  if(target != "") {
    $('#main').load(target+'.html');
  }
}

function broadCastTest() {
  // broadcast = {
  //   title:":: TESTING BROADCAST ::",
  //   file:"test",
  //   priority:"1",
  //   duration:"2000",
  //   colorscheme:"0"
  // };
  // socket.emit('broadcastSend', broadcast);
  broadCast(testBroadcast);

}

// function: broadcast .
function broadCast(location) {
  //
  // activeBroadcast = {
  //   title       :location['title'],
  //   file        :location['file'],
  //   priority    :location['priority'],
  //   duration    :location['duration'],
  //   colorscheme :location['colorscheme']
  // }
  activeBroadcast.empty();
  activeBroadcast = new broadcastObj(location['title'],location['file'],location['priority'],location['duration'],location['colorscheme']);
  console.log('active: '+ activeBroadcast['title']);

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
    if(location['title'] != "") {
      $("#lastBroadcastTitle").html(location['title']);
    }

    $("#lastBroadcastTime").html(currentTimeString);

    $.get('/broadcasts/'+location['file']+'.html')
      .done(function(){

        if(location['priority'] > 0 && !isNaN(location['duration'])) {
          if(location['priority'] < activeBroadcast['priority']) {
            return false;
          } else {
            $("#notificationContainer").empty();
              $('#notificationContainer').load('/broadcasts/'+location['file']+'.html');

              // if(location['duration'] && location['duration'] > 0 && !isNaN(location['duration'])) {
              //   console.log('test3'+location['duration']);
              //   resetBroadcast(location['duration']);
              // }
          }
        }
      })
      .fail(function(){
        $("#notificationContainer").empty();
          $("#notificationContainer").load('/broadcasts/404.html');
      });
  }

}


// maakt de footer blokken equally groot aan de eerste.
function updateFooter() {
  $(".item").height($('#firstFooterBlock').height());
}

function resetBroadcast(duration){
  console.log('test4:'+duration);

  broadcast = {
    title:"Clear",
    file:"standby",
    priority:"10",
    duration:"0",
    colorscheme:"0"
  };

  setTimeout(function(){
    broadCast(broadcast);
  },duration);

  socket.emit('broadcastSend', broadcast);
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
