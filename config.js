

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

const valid_accounts = [];

/*
add entries here to make legit accounts, bound to a five-digit code.
For example:
  valid_accounts.push(new accountObj('99999','1'));

the second digit, which is '1' in our example, determines the user 'rank'. The higher, the better, going from 1 to 4.
a full admin/gamemaster would be:
  valid_accounts.push(new accountObj('00451','4'));
*/
valid_accounts.push(new accountObj('61021','2'));
valid_accounts.push(new accountObj('15101','3'));
valid_accounts.push(new accountObj('34471','4'));


/* Send config/settings to main server (( index.js )) */
exports.cfg    = system_details;
exports.sys    = system_settings;
exports.data   = application_defaults;
exports.accounts = valid_accounts;
