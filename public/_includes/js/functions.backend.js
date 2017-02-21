
// wisselt tussen de tabjes in de backend door ze hidden te maken en de 'target' dan niet meer hidden te maken.
function navigateADM(target) {
  $('.adm-nav').removeClass('active');
  $('.adm-tab').addClass('hidden');
  $('#'+target).removeClass('hidden');
  $('#btn-'+target).addClass('active');
}

// momenteel niet meer dan een test:
// authenticeerd de "login", als we het atm zo mogen noemen.
function authAdm(code) {

  // idee: socket emit 'code', en stuur een SUCCESS // FALSE terug? ///////////////////////
  if(code == '00451') {
    $('#cPanel').load('/adm/cpanel.html');
    navigate('/adm/adminPanel');
  }
}
