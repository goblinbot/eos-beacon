

/* configuration. */
system_details = {
  appname : 'BEACON',
  appdescription : '/ EOS BASTION INFORMATION SERVICE',
}

/* system settings: This can generally be left alone. */
system_settings = {
  port : 5001,
}

/* Settings for defaults that appear on screen. For example, the default security level, or date. */
application_defaults = {
  default_security_level : "Code green - All clear",
}

/* code for accounts */
function accountObj(logincode,loginrank) {
  this.logincode = logincode;
  this.loginrank = loginrank;
}
var valid_accounts = [];


/*
add entries here to make accounts, bound to a five-digit code.
For example:
  valid_accounts[5] = (new accountObj('99999','1'));
the second digit, which is '1' in our example, determines the user 'rank'. The higher, the better, going from 1 to 4.
a full admin/gamemaster would be:
  valid_accounts[0] = (new accountObj('00451','4'));
*/
valid_accounts[0] = (new accountObj('61021','4'));
valid_accounts[2] = (new accountObj('45100','3'));
valid_accounts[3] = (new accountObj('67790','1'));
valid_accounts[4] = (new accountObj('34471','2'));

/* Send config/settings to main server */
exports.cfg    = system_details;
exports.sys    = system_settings;
exports.data   = application_defaults;
exports.accounts = valid_accounts;
