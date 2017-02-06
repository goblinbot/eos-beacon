var socket      = io();






function navigate(target) {
  if(target != "") {
    $('#main').load(target+'.html');
  }
}

// CLOCK
function updateClock() {
 	var currentTime = new Date();
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
 }
 $(document).ready(function() {
    setInterval('updateClock()', 1000);
    // setInterval('holiday()'    , 1000);
 });
