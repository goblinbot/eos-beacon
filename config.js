/* configuration. */
SYSTEM_DETAILS = {
  appname : 'BEACON',
  appdescription : '/ EOS BASTION INFORMATION SERVICE',
}

/* system settings: This can generally be left alone. */
SYSTEM_SETTINGS = {
  port : 5001, /* declares which port BEACON will run on. By default: 5000. */
  voiceEnabled: false,
}

/* Settings for defaults that appear on screen. For example, the default security level */
APPLICATION_DEFAULTS = {
  defaultSecurityLevel : "Code green - All clear",
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
  VALID_ACCOUNTS.push(new accountObj('00451','4'));
at this time, 1 = general use, 2 = medical, 3 = customs, 4 = admin

*/
const VALID_ACCOUNTS = [
  new accountObj('10191', '1'),
  new accountObj('61021', '2'),
  new accountObj('15101', '3'),
  new accountObj('34471', '4'),
];

/* Send config/settings to main server (( index.js )) */
exports.cfg    = SYSTEM_DETAILS;
exports.sys    = SYSTEM_SETTINGS;
exports.data   = APPLICATION_DEFAULTS;
exports.accounts = VALID_ACCOUNTS;
