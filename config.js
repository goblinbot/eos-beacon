

/* configuration. */
system_details = {
  appname : 'BEACON',
  appdescription : '/ EOS BASTION INFORMATION SERVICE',
}

/* system settings: This can generally be left alone. */
system_settings = {
  port : 5001, /* declares which port BEACON will run on. By default: 5000. */
}

/* Settings for defaults that appear on screen. For example, the default security level */
application_defaults = {
  default_security_level : "Code green - All clear",
}

/* creating the account object, to re use later */
function accountObj(logincode,loginrank) {
  this.logincode = logincode;
  this.loginrank = loginrank;
}


/*
add entries here to make legit accounts, bound to a five-digit code.
the second digit, which is '1' in our example, determines the user 'rank'. The higher, the better, going from 1 to 4.
a full admin/gamemaster would be:
  valid_accounts.push(new accountObj('00451','4'));
at this time, 1 = general use, 2 = medical, 3 = customs, 4 = admin

*/
const valid_accounts = [
  new accountObj('10100', '1'),
  new accountObj('61021', '2'),
  new accountObj('15101', '3'),
  new accountObj('34471', '4'),
];

/* Send config/settings to main server (( index.js )) */
exports.cfg    = system_details;
exports.sys    = system_settings;
exports.data   = application_defaults;
exports.accounts = valid_accounts;
