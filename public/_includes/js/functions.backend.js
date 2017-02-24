
// wisselt tussen de tabjes in de backend door ze hidden te maken en de 'target' dan niet meer hidden te maken.
function navigateADM(target) {
  $('.adm-nav').removeClass('active');
  $('.adm-tab').addClass('hidden');
  $('#'+target).removeClass('hidden');
  $('#btn-'+target).addClass('active');
}



function forceReset() {
  socket.emit('forceReset');
}

function resetSecStatus() {
  socket.emit('clearAll');
}


function cpanelStatus(message) {
  if(message != null && message != "") {
    $('#cPanel-status').empty();
    $('#cPanel-status').html(message);
  }
}




// ..
// Internet's meest generieke, gecopypaste en gestolen functie allertijden :
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}


function logout() {
  setCookie('auth','false','-1');
  location.href = "/adm/index.html";
}
