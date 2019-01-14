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
    serverHeader = "Started: "+serverStartTime.toDateString()+" "+serverStartTime.toTimeString()+"\n";
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
var httpLogAdd = function(date, toAdd){
  var date = new Date();
  httpLog = date.toDateString()+" "+date.toTimeString()+": "+ toAdd + httpLog; // Add it to the top.
};

// TRELLO
const trelloDevKey = process.env.TRELLO_DEV_KEY;
const jaysTrelloBotToken = process.env.TRELLO_BOT_TOKEN; // This is the bot's token.
var botTrello = new trello(trelloDevKey, jaysTrelloBotToken); // Connect to Trello


// This function tries to find the card to be created by name. If it doesn't exist, it creates it. If it does, but in
// a different list, it moves it, and if it exists in the same list, it is commented on.
var staticScheduleCardFunc = function(newCard) {
  var date = new Date();
  if(newCard.dayRange === undefined || newCard.dayRange.includes(date.getDate())) { // Only proceed if dayRange is undefined or today is within the range.
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
      else if(existingCard.idList !== newCard.idList) { // Move card (and update to current definition)
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
    });
  }
};

// IDS
// TASKS
// Boards
var tasksBoardId = "54801c047914fe7d632bc4b5";
// Lists
var taskToDoListId = "57782b97434403f86849e905";
// Labels
var nodeJsLabelId = "57d8bb57412839bd591a61c5";
var homeLabelId = "56fedc7b666a062f88ec113b";
var mediaLabelId = "54801c0474d650d567a6ecdb";
var computerLabelId = "571be6f6b0dfecc6d104b358";

// HOUSEKEEPING
// Boards
//var tasksBoardId = "54801c047914fe7d632bc4b5";
// Lists
//var taskToDoListId = "57782b97434403f86849e905";


// Cards
// Static cards: These cards are scheduled for the same time, regardless of when I accomplish them.
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
var cleanRoomCard = {
  name: "Clean Room",
  cronSchedule: "0 12 * * 7", // Every 1st and 3rd week on Sunday at noon
  dayRange: [0,1,2,3,4,5,6, 14,15,16,17,18,19,20],
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var freegalCard = {
  name: "Download Freegal Music",
  cronSchedule: "0 18 * * 1", // Weekly on Monday at 6PM
  desc: "Download music from Freegal \n \n"+
    "Freegal: http://slcpl.freegalmusic.com/homes/index \n"+
    "Music: https://trello.com/c/Ah8avhIc/14-audio",
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, mediaLabelId, computerLabelId]
};
var payRentTask = cron.schedule(payRentCard.cronSchedule, function(){staticScheduleCardFunc(payRentCard);});
var moneyReviewTask = cron.schedule(moneyReviewCard.cronSchedule, function(){staticScheduleCardFunc(moneyReviewCard);});
var cleanRoomTask = cron.schedule(cleanRoomCard.cronSchedule, function(){staticScheduleCardFunc(cleanRoomCard);});
var freegalTask = cron.schedule(freegalCard.cronSchedule, function(){staticScheduleCardFunc(freegalCard);});


// HOUSEKEEPING
var waterPlantsCard = {
  name: "Water Plants",
  cronSchedule: "0 18 * * 2", // Weekly on Tuesday at 6PM
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var washSheetsCard = {
  name: "Wash Sheets",
  cronSchedule: "0 18 * * 3", // Monthly on the 1st Wednesday at 6PM
  dayRange: [0,1,2,3,4,5,6],
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var takeOutTrashCard = {
  name: "Take Out Trash",
  desc: "Take trash cans to the curb",
  cronSchedule: "0 19 * * 2", // Weekly on Tuesday at 7PM
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var bringInTrashCard = {
  name: "Bring In Trash",
  desc: "Bring trash cans in from the curb",
  cronSchedule: "0 19 * * 3", // Weekly on Wednesday at 7PM
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var vacuumCard = {
  name: "Vacuum House",
  desc: "Vacuum the entire house",
  cronSchedule: "0 12 * * 7", // Monthly on the 1st Sunday at noon
  dayRange: [0,1,2,3,4,5,6],
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var kitchenCard = {
  name: "Clean Kitchen",
  desc: "Clean kitchen, including mopping.",
  cronSchedule: "0 12 * * 7", // Monthly on the 2nd Sunday at noon
  dayRange: [7,8,9,10,11,12,13],
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};
var bathroomCard = {
  name: "Clean Bathrooms",
  desc: "Clean both bathrooms.",
  cronSchedule: "0 12 * * 7", // Monthly on the 3nd Sunday at noon
  dayRange: [14,15,16,17,18,19,20],
  idBoard: tasksBoardId,
  idList: taskToDoListId,
  pos:"top",
  idLabels: [nodeJsLabelId, homeLabelId]
};

var waterPlantsTask = cron.schedule(waterPlantsCard.cronSchedule, function(){staticScheduleCardFunc(waterPlantsCard);});
var takeOutTrashTask = cron.schedule(takeOutTrashCard.cronSchedule, function(){staticScheduleCardFunc(takeOutTrashCard);});
var bringInTrashTask = cron.schedule(bringInTrashCard.cronSchedule, function(){staticScheduleCardFunc(bringInTrashCard);});
var washSheetsTask = cron.schedule(washSheetsCard.cronSchedule, function(){staticScheduleCardFunc(washSheetsCard);});
var vacuumTask = cron.schedule(vacuumCard.cronSchedule, function(){staticScheduleCardFunc(vacuumCard);});
var kitchenTask = cron.schedule(kitchenCard.cronSchedule, function(){staticScheduleCardFunc(kitchenCard);});
var bathroomTask = cron.schedule(bathroomCard.cronSchedule, function(){staticScheduleCardFunc(bathroomCard);});

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
