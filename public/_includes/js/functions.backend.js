
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

function setSoundSettings(option) {
  if(!option || option > 2 || option < 0 || option == "") {
    option = '2';
  }
  socket.emit('setSoundSetting', option);
}


function cpanelStatus(message) {
  if(message != null && message != "") {
    $('#cPanel-status').empty();
    $('#cPanel-status').html('<span class=\"text-bold\">current broadcast:&nbsp;</span>' + message);
  }
}

function updateSecurity(selector) {
  var newSecLevel = $('#'+selector).val();
  var FlashFunctie = FlashBlocks;

  if(newSecLevel && newSecLevel != "") {

    socket.emit( 'updateSecurity', newSecLevel );
    FlashFunctie('.adm-tab');
    setTimeout(function(){
      FlashFunctie('.adm-tab');
    },1200);

  }

}

$(document).ready(function(){

  $('.btn').on('click', function(e){

    if($(this).hasClass('disabled')){
      e.stopImmediatePropagation();
      e.preventDefault();
      console.log('too fast!');
      return false;
    }

    $('.btn').addClass('disabled');
    $('.btn').attr("disabled", true);

    setTimeout(function(){
      $('.btn').removeClass('disabled');
      $('.btn').attr("disabled", false);

      $('.adm-tab').removeClass('flash');
    },2000);

  });


});


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
