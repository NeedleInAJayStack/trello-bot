const http = require('http');
const cron = require('node-cron'); // Doc here: https://www.npmjs.com/package/node-cron
const trello = require('node-trello'); // Doc here: https://www.npmjs.com/package/node-trello
const serverStartTime = new Date();
var serverHeader = "";
var httpLog = "";

// Create a simple server
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  serverHeader = "Started: "+serverStartTime.toDateString()+" "+serverStartTime.toTimeString()+"\n";
  res.end(serverHeader+httpLog);
});

server.listen(port, hostname, () => {
  console.log("Server running at http://"+hostname+":"+port+"/");
});

// Adds the specified message to the top of the http log.
var httpLogAdd = function(toAdd){
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
  botTrello.get('/1/boards/'+lifeBoardId+'/cards/', function(err, data) {
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
    else if(existingCard.idList !== newCard.idList) { // Move existing one into the right list
      botTrello.put('/1/cards/'+existingCard.id+'/idList/', {value: newCard.idList}, function(err, data) {
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
};

// IDS
// Boards
var lifeBoardId = "54801c047914fe7d632bc4b5";
// Lists
var toDoListId = "57782b97434403f86849e905";
// Labels
var nodeJsLabelId = "57d8bb57412839bd591a61c5";
var homeLabelId = "56fedc7b666a062f88ec113b";
var mediaLabelId = "54801c0474d650d567a6ecdb";
var computerLabelId = "571be6f6b0dfecc6d104b358";


// Cards
// Static cards: These cards are scheduled for the same time, regardless of when I accomplish them.
var freegalCard = {
  name: "Download Freegal Music",
  cronSchedule: "0 0 18 * * 1", // Weekly on Monday at 6PM
  desc: "Download music from Freegal \n \n"+
    "Freegal: http://slcpl.freegalmusic.com/homes/index \n"+
    "Music: https://trello.com/c/Ah8avhIc/14-audio",
  idList: toDoListId,
  idLabels: [nodeJsLabelId, mediaLabelId, computerLabelId]
};
var waterPlantsCard = {
  name: "Water Plants",
  cronSchedule: "0 0 18 * * 3", // Weekly on Wednesday at 6PM
  idList: toDoListId,
  idLabels: [nodeJsLabelId, homeLabelId]
};
var moneyReviewCard = {
  name: "Monthly Money Review",
  cronSchedule: "0 0 18 28 * *", // Monthly on the 28th at 6PM
  desc: "Review your monthly spending in GnuCash.",
  idList: toDoListId,
  idLabels: [nodeJsLabelId, homeLabelId]
};
var payRentCard = {
  name: "Pay Rent",
  cronSchedule: "0 0 18 1 * *", // Monthly on the 1st at 6PM
  desc: "Pay rent to Chris.",
  idList: toDoListId,
  idLabels: [nodeJsLabelId, homeLabelId]
};
// TODO move washSheetsCard to a dynamic type once I figure out how to monitor for "done".
var washSheetsCard = {
  name: "Wash Sheets",
  cronSchedule: "0 0 18 6 * *", // Monthly on the 6th at 6PM
  idList: toDoListId,
  idLabels: [nodeJsLabelId, homeLabelId]
};

// These cards are based on a time-interval from when I last accomplished them.
var dynamicCards = [];


// CARD CREATION
// Static cards (assume they were deleted after they were finished.)
var freegalTask = cron.schedule(freegalCard.cronSchedule, function(){staticScheduleCardFunc(freegalCard);});
var waterPlantsTask = cron.schedule(waterPlantsCard.cronSchedule, function(){staticScheduleCardFunc(waterPlantsCard);});
var moneyReviewTask = cron.schedule(moneyReviewCard.cronSchedule, function(){staticScheduleCardFunc(moneyReviewCard);});
var payRentTask = cron.schedule(payRentCard.cronSchedule, function(){staticScheduleCardFunc(payRentCard);});
var washSheetsTask = cron.schedule(washSheetsCard.cronSchedule, function(){staticScheduleCardFunc(washSheetsCard);});

// TESTING

// Get all node.js cards - This works, but I'm not sure how to use it yet.
//var jsonfile = require('jsonfile');
//var getNodeCards = function() {
//  botTrello.get('/1/boards/'+lifeBoardId+'/cards/', function(err, data) {
//    if (err) throw err;
//
//    var cards = data;
//    var nodeCards = [];
//    cards.forEach(function(card, array, index) { // Find the ones with the node.js label
//      var labels = [,];
//      if("idLabels" in card) labels = card.idLabels;
//      if(labels.indexOf(nodeJsLabelId) > -1) nodeCards.push(card); // If not included, indexOf returns -1
//    });
//    jsonfile.writeFile('/home/jay/dev/node.js/nodeCards.json', nodeCards,function (err) { // This writes the object to nodeCards.json
//      console.error(err);
//    });
//  });
//};

