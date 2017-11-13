/*
==== =================================================================

==    BROADCASTS.JS    ==
==    Hier bouwen we onze technische calls op voor broadcasts.

==== =================================================================
==    Door Thijs Boerma, th.boerma@gmail.com | 2017                 ==
==== =================================================================
*/


// BROADCAST OBJECTEN
// constructor:
function broadcastObj(title, file, priority, duration, colorscheme) {
  this.title = title;
  this.file = file;
  this.priority = priority;
  this.duration = duration;
  this.colorscheme = colorscheme;
}

/* Systeem */
var bcdefault = new broadcastObj("Standby","bcdefault",1,"0","0");
var bcreset = new broadcastObj("Standby","bcdefault",99,"0","0");

/* keuken crew */
var bclunch = new broadcastObj("Lunch announcement","bclunch",2,"0","0");
var bcdinner = new broadcastObj("Dinner announcement","bcdinner",2,"0","0");
var bcdishes = new broadcastObj("Dishes reminder","bcdishes",2,"0","0");

/* andere PSA's */
var bchydrate = new broadcastObj("Hydration Reminder","bchydrate",2,"0","0");
var bcmedical = new broadcastObj("Blood Donation Request","bcmedical",2,"0","0");
var bcmeeting = new broadcastObj("Meeting in Main","bcmeeting",4,"0","0");
var bcblood   = new broadcastObj("Blood Donation Demand","bcblood",4,"0","0");
var bcMissionOut   = new broadcastObj("STRATI.OS.PUSH","bcMissionOut",5,"0","0");

/* Temple */
/*var bcidiotservice = new broadcastObj("Maïr Temple Service","bctempleservice",3,"0","0");*/

/* hazards */
var bcviral = new broadcastObj("Unknown Viral Pathogens detected","bcviral",8,"0","hazard");
var bcbiohazard = new broadcastObj("Environmental Hazard detected","bcbiohazard",8,"0","hazard");
var bcpsyhazard = new broadcastObj("Psy-hazard detected","bcpsyhazard",8,"0","psyhazard");
var bchostile = new broadcastObj("Enemy Contact","bchostile",8,"0","attack");
var bcbomb = new broadcastObj("Bomb Alert","bcbomb",8,"0","hazard");

/* portal */
var bcportalinc = new broadcastObj("Portal Incoming","bcportalinc",3,"30000","0");
var bcportalout = new broadcastObj("Portal Outgoing","bcportalout",3,"17500","0");

/* Overlord-only */
var bctransmission = new broadcastObj("Standby","bctransmission",5,"0","0");
var bclowpower = new broadcastObj("POWER SUPPLY WARNING","bclowpower",8,"0","gray");
var bcreactorcrit = new broadcastObj("Reactor Critical","bcreactorcrit",9,"0","attack");
var bchackattack = new broadcastObj("Security Breach","bchackattack",9,"0","0");

/* Maati's Eos IT toolbox */
var bcsystemscan = new broadcastObj("System Diagnostics","bcsystemscan",88,"30000","0");
var bcfreezeall = new broadcastObj("ADMIN.OVERRIDE","bcfreezeall",100,"0","0");

/* Testomgeving */
var bcmaati = new broadcastObj("test","bcmaati",9,"0","0");


/* VIDEOS */
var bcOCannounce = new broadcastObj("VID.TRANSMISSION","bcOCannounce",9,"0","0");
var bcICstartvideo = new broadcastObj("VID.TRANSMISSION","bcICstartvideo",9,"0","0");
var bcICaquilaGeneralvideo = new broadcastObj("VID.TRANSMISSION","bcICaquilaGeneralvideo",9,"0","0");
