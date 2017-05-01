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

// de broadcasts !
var defaultBroadcast = new broadcastObj("Broadcast Initialise","standby",1,"0","0");
var resetBroadcast = new broadcastObj("Clear","standby",99,"0","0");

var broadCastLunch = new broadcastObj("Lunch announcement","lunch",2,"0","0");
var broadCastDinner = new broadcastObj("Dinner announcement","dinner",2,"0","0");
var broadCastHydrate = new broadcastObj("Hydration Reminder","hydratePSA",2,"0","0");

var broadCastPortalIncoming = new broadcastObj("Portal Incoming","portalincoming",3,"30000","0");
var broadCastPortalOutgoing = new broadcastObj("Portal Outgoing","portaloutgoing",3,"17500","0");
var broadCastBlood = new broadcastObj("Medical Request","bloodrequest",4,"0","0");

var hazardBroadcast = new broadcastObj("Envirnomental Hazard detected","biohazard",8,"0","hazard");
var psyWarningBroadcast = new broadcastObj("Psy-hazard detected","psyhazard",8,"0","psyhazard");
var broadCastEnemyContact = new broadcastObj("Enemy Contact","enemycontact",8,"0","attack");
var lowpowerBroadcast = new broadcastObj("POWER SUPPLY WARNING","emergencypower",8,"0","gray");

var broadcasteaster = new broadcastObj("HELLoYES","StopMaati",8,"0","gray");
