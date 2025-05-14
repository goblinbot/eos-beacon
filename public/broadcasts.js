/*
==== ================================================================= ====
 ==    BROADCASTS.JS                                                    ==
 ==    In this file, we declare the broadcasts by using 'broadcastObj' as our template.
==== ================================================================= ====
 ==    By Thijs Boerma, th.boerma@gmail.com | 2017                      ==
==== ================================================================= ====
*/


/* BROADCAST OBJECTEN */
/* constructor: */
function broadcastObj(title, file, priority, duration, colorscheme) {
  this.title = title;
  this.file = file;
  this.priority = priority;
  this.duration = duration;
  this.colorscheme = colorscheme;
}

/* System broadcasts */
var bcdefault = new broadcastObj("Standby", "bcdefault", 1, "0", "0");
var bcreset = new broadcastObj("Standby", "bcdefault", 99, "0", "0");

/* kitchen crew */
var bclunch = new broadcastObj("Lunch announcement", "bclunch", 2, "0", "0");
var bcdinner = new broadcastObj("Dinner announcement", "bcdinner", 2, "0", "0");
var bcdishes = new broadcastObj("Dishes reminder", "bcdishes", 2, "0", "0");

/* other PSA's */
var bctempleservice = new broadcastObj("Tachar Service", "bctempleservice", 2, "600000", "0");
var bcmedical = new broadcastObj("Blood Donation Request", "bcmedical", 2, "0", "0");
var bcmeeting = new broadcastObj("Meeting in Main", "bcmeeting", 4, "0", "0");
var bcblood = new broadcastObj("Blood Donation Demand", "bcblood", 4, "0", "0");
var bcmedbay = new broadcastObj("Medical Personel to Medbay", "bcmedbay", 6, "0", "0");
var bcmedicalsupport = new broadcastObj("Insufficient Medical Staff", "bcmedicalsupport", 6, "0", "0");

/* reminders */
var bchydrate = new broadcastObj("Hydration Reminder", "bchydrate", 1, "600000", "0");
var bcsunscreen = new broadcastObj("Sunscreen Reminder", "bcsunscreen", 1, "600000", "0");
var bcthankyou = new broadcastObj("Kindness Reminder", "bcthankyou", 1, "600000", "0");
var bctalon = new broadcastObj("Talon Reminder", "bctalon", 1, "600000", "0");
var bcmorning = new broadcastObj("Morning Reminder", "bcmorning", 1, "3600000", "0");
var bcgotobed = new broadcastObj("Sleep Reminder", "bcgotobed", 1, "10800000", "gray");

/* hazards */
var bcviral = new broadcastObj("Unknown Viral Pathogens detected", "bcviral", 8, "0", "hazard");
var bcbiohazard = new broadcastObj("Environmental Hazard detected", "bcbiohazard", 8, "0", "hazard");
var bcpsyhazard = new broadcastObj("Psy-hazard detected", "bcpsyhazard", 8, "0", "psyhazard");
var bcbomb = new broadcastObj("Bomb Alert", "bcbomb", 8, "0", "hazard");

/* Shield-Orb */
var bcorbactivate = new broadcastObj("Orb reactivation", "bcorbactivate", 8, "45000", "0");
var bcorbcooldown = new broadcastObj("Orb Cooldown phase", "bcorbcooldown", 8, "0", "psyhazard");

/* confirm hostiles */
var bchostileoutside = new broadcastObj("Enemy Contact", "bchostileoutside", 8, "0", "0");
var bchostileinside = new broadcastObj("Enemy Contact", "bchostileinside", 8, "0", "attack");

/* portal */
var bcportalinc = new broadcastObj("Scheduled Incoming Portal Activation", "bcportalinc", 3, "30000", "0");
var bcportalincdanger = new broadcastObj("Unscheduled Incoming Portal Activation", "bcportalincdanger", 3, "30000", "0");
var bcportalout = new broadcastObj("Portal Outgoing", "bcportalout", 3, "17500", "0");

var bcportalinc_voice = new broadcastObj("Scheduled Incoming Portal Activation", "bcportalinc_voice", 3, "30000", "0");
var bcportalincdanger_voice = new broadcastObj("Unscheduled Incoming Portal Activation", "bcportalincdanger_voice", 3, "30000", "0");
var bcportalout_voice = new broadcastObj("Portal Outgoing", "bcportalout_voice", 3, "17500", "0");

/* Overlord-only */
var bctransmission = new broadcastObj("Incoming Transmission", "bctransmission", 5, "0", "0");
var bctransmissionend = new broadcastObj("Incoming Transmission", "bctransmissionend", 10, "17500", "0");
var bclowpower = new broadcastObj("POWER SUPPLY WARNING", "bclowpower", 8, "0", "gray");
var bcreactorcrit = new broadcastObj("Reactor Critical", "bcreactorcrit", 9, "0", "attack");
var bchackattack = new broadcastObj("Security Breach", "bchackattack", 9, "0", "0");

/* Maati's Eos IT toolbox */
var bcsystemscan = new broadcastObj("System Diagnostics", "bcsystemscan", 88, "30000", "0");
var bcfreezeall = new broadcastObj("ADMIN.OVERRIDE", "bcfreezeall", 100, "0", "0");

/* VIDEOS */
var bcspoilervideo = new broadcastObj("VID.TRANSMISSION", "bcspoilervideo", 9, "0", "0");
