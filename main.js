const http = require('http');
const cron = require('node-cron'); // Doc here: https://www.npmjs.com/package/node-cron
const trello = require('node-trello'); // Doc here: https://www.npmjs.com/package/node-trello
const serverStartTime = new Date();
var serverHeader = "";
var httpLog = "";

// Create a simple server
const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  if(req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    serverHeader = "Started: "+serverStartTime.toDateString()+" "+serverStartTime.toTimeString()+"\n\n";
    res.end(serverHeader+httpLog);
  }
  else {
    res.statusCode = 405;
  }
});

server.listen(port, hostname, () => {
  console.log("Server running at http://"+hostname+":"+port+"/");
});

// Adds the specified message to the top of the http log.
var httpLogAdd = function(toAdd){
  var date = new Date();
  httpLog = date.toDateString()+" "+date.toTimeString()+": "+ toAdd + "\n" + httpLog; // Add it to the top.
};

// TRELLO
const trelloDevKey = process.env.TRELLO_DEV_KEY;
const jaysTrelloBotToken = process.env.TRELLO_BOT_TOKEN; // This is the bot's token.
var botTrello = new trello(trelloDevKey, jaysTrelloBotToken); // Connect to Trello


// This function tries to find the card to be created by name. If it doesn't exist, it creates it. If it does, but in
// a different list, it moves it, and if it exists in the same list, it is commented on.
var staticScheduleCardFunc = function(newCard) {
  var date = new Date();
  if(newCard.dayRange === undefined || newCard.dayRange.indexOf(date.getDate()) > -1) { // Only proceed if dayRange is undefined or today is within the range.
    botTrello.get('/1/boards/'+newCard.idBoard+'/cards/', function(err, data) {
      if (err) throw err;

      var existingCard = null;
      data.forEach(function(card, array, index) { // Find if one with the same name exists
        if(card.name === newCard.name) existingCard = card; // Match up cards by name.
      });
      if(existingCard === null) { // Create the new card
        botTrello.post('/1/cards/', newCard, function(err, data) {
          if (err) throw err;
          httpLogAdd('"'+newCard.name+'" created successfully. \n');
        });
      }
      else {
        if(existingCard.idList !== newCard.idList) { // Move card to the correct list and update to definition
          botTrello.put('/1/cards/'+existingCard.id, newCard, function(err, data) {
            if (err) throw err;
            httpLogAdd('"'+existingCard.name+'" moved successfully. \n');
          });
        }
        else { // In this case, it's already there. Just comment.
          var comment = "Schedule hit again.";
          botTrello.post('/1/cards/'+existingCard.id+'/actions/comments/', {text: comment}, function(err, data) {
            if (err) throw err;
            httpLogAdd('"'+existingCard.name+'" commented with "'+comment+'". \n');
          });
        }
      }
    });
  }
};

// Monthly date range rules. According to these rules, weeks will occasionally be skipped.
var firstWeek = [1,2,3,4,5,6,7];
var secondWeek = [8,9,10,11,12,13,14];
var thirdWeek = [15,16,17,18,19,20,21];
var fourthWeek = [22,23,24,25,26,27,28];
var firstAndThirdWeek = [1,2,3,4,5,6,7, 15,16,17,18,19,20,21];
var secondAndFourthWeek = [8,9,10,11,12,13,14, 22,23,24,25,26,27,28];


// TASKS
// Board
var tasksBoardId = "54801c047914fe7d632bc4b5";
// List
var taskToDoListId = "57782b97434403f86849e905";
// Labels
var nodeJsLabelId = "57d8bb57412839bd591a61c5";
var homeLabelId = "56fedc7b666a062f88ec113b";
var mediaLabelId = "54801c0474d650d567a6ecdb";
var computerLabelId = "571be6f6b0dfecc6d104b358";

// Cards
// Relevant card parameters are defined according to Trello post method: https://developers.trello.com/v1.0/reference#cards-2

var payRentCard = {
  name: "Pay Rent",
  cronSchedule: "0 18 1 * *", // Monthly on the 1st at 6PM
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var moneyReviewCard = {
  name: "Monthly Money Review",
  cronSchedule: "0 18 28 * *", // Monthly on the 28th at 6PM
  desc: "Review your monthly spending in GnuCash",
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var freegalCard = {
  name: "Download Freegal Music",
  cronSchedule: "0 18 * * 1", // Weekly on Monday at 6PM
  desc: "Download music from Freegal\n"+
    "\n"+
    "Freegal: http://slcpl.freegalmusic.com/homes/index\n"+
    "Music: https://trello.com/c/Ah8avhIc/14-audio",
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, mediaLabelId, computerLabelId]
};
var payRentTask = cron.schedule(payRentCard.cronSchedule, function(){staticScheduleCardFunc(payRentCard);});
var moneyReviewTask = cron.schedule(moneyReviewCard.cronSchedule, function(){staticScheduleCardFunc(moneyReviewCard);});
var freegalTask = cron.schedule(freegalCard.cronSchedule, function(){staticScheduleCardFunc(freegalCard);});


// CHORES
// Board
var choresBoardId = "5c3bdd372d6d6b140cc666cc";
// List
var choresToDoListId = "5c3be3e55d1701051d84a108";
// Labels
var choresScheduledLabelId = "5c3c244581ecf8775c3c470a";

// Cards
var waterPlantsCard = {
  name: "Water Plants",
  cronSchedule: "0 18 * * 2", // Weekly on Tuesday at 6PM
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var dogTeethCard = {
  name: "Brush Gracie's Teeth",
  cronSchedule: "0 18 * * 1", // Weekly on Monday at 6PM
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var washSheetsCard = {
  name: "Wash Sheets",
  cronSchedule: "0 18 * * 3", // Monthly on the 1st Wednesday at 6PM
  dayRange: firstWeek,
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var takeOutTrashCard = {
  name: "Take Out Trash",
  desc: "Take trash, recycling, and compost cans to the curb",
  cronSchedule: "0 19 * * 2", // Weekly on Tuesday at 7PM
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var bringInTrashCard = {
  name: "Bring In Trash",
  desc: "Bring in trash, recycling, and compost cans from the curb",
  cronSchedule: "0 19 * * 3", // Weekly on Wednesday at 7PM
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var bedroomCard = {
  name: "Clean Bedroom",
  desc: "* Pick up clutter\n"+
    "* Dust\n"+
    "* Sweep/Vacuum",
  cronSchedule: "0 12 * * 6", // Monthly on the 1st Saturday at noon
  dayRange: firstWeek,
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var kitchenCard = {
  name: "Clean Kitchen",
  desc: "* Wipe countertops\n"+
    "* Wipe/dust appliances\n"+
    "* Clean stovetop\n"+
    "* Clean microwave\n"+
    "* Clean sink\n"+
    "* Sweep/Vacuum\n"+
    "* Mop",
  cronSchedule: "0 12 * * 6", // Monthly on the 2nd Saturday at noon
  dayRange: secondWeek,
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var bathroomCard = {
  name: "Clean Bathrooms",
  desc: "* Clean mirrors\n"+
    "* Clean tub\n"+
    "* Clean sinks\n"+
    "* Clean toilets\n"+
    "* Sweep/Vacuum\n"+
    "* Mop",
  cronSchedule: "0 12 * * 6", // Monthly on the 3nd Saturday at noon
  dayRange: thirdWeek,
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};
var livingRoomCard = {
  name: "Clean Living Room",
  desc: "* Pick up clutter\n"+
    "* Dust\n"+
    "* Clean glass tables\n"+
    "* Sweep/Vacuum",
  cronSchedule: "0 12 * * 6", // Monthly on the 4th Saturday at noon
  dayRange: fourthWeek,
  idBoard: choresBoardId,
  idList: choresToDoListId,
  pos:"top",
  idLabels: [choresScheduledLabelId]
};


var waterPlantsTask = cron.schedule(waterPlantsCard.cronSchedule, function(){staticScheduleCardFunc(waterPlantsCard);});
var dogTeethTask = cron.schedule(dogTeethCard.cronSchedule, function(){staticScheduleCardFunc(dogTeethCard);});
var washSheetsTask = cron.schedule(washSheetsCard.cronSchedule, function(){staticScheduleCardFunc(washSheetsCard);});
var takeOutTrashTask = cron.schedule(takeOutTrashCard.cronSchedule, function(){staticScheduleCardFunc(takeOutTrashCard);});
var bringInTrashTask = cron.schedule(bringInTrashCard.cronSchedule, function(){staticScheduleCardFunc(bringInTrashCard);});
var bedroomTask = cron.schedule(bedroomCard.cronSchedule, function(){staticScheduleCardFunc(bedroomCard);});
var kitchenTask = cron.schedule(kitchenCard.cronSchedule, function(){staticScheduleCardFunc(kitchenCard);});
var bathroomTask = cron.schedule(bathroomCard.cronSchedule, function(){staticScheduleCardFunc(bathroomCard);});
var livingRoomTask = cron.schedule(livingRoomCard.cronSchedule, function(){staticScheduleCardFunc(livingRoomCard);});



// TESTING

// Get all trello cards.
//var jsonfile = require('jsonfile');
//var getNodeCards = function() {
//  botTrello.get('/1/boards/'+tasksBoardId+'/cards/', function(err, data) {
//    if (err) throw err;
//
//    var cards = data;
//    var nodeCards = [];
//    cards.forEach(function(card, array, index) { // Find the ones with the node.js label
//      var labels = [,];
//      if("idLabels" in card) labels = card.idLabels;
//      if(labels.indexOf(nodeJsLabelId) > -1) nodeCards.push(card); // If not included, indexOf returns -1
//    });
//    jsonfile.writeFile('/home/jay/dev/node.js/nodeCards.json', nodeCards, function (err) { // This writes the object to nodeCards.json
//      console.error(err);
//    });
//  });
//};
