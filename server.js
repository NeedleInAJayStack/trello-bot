const http = require('http');
const cron = require('node-cron'); // Doc here: https://www.npmjs.com/package/node-cron
const trello = require('node-trello'); // Doc here: https://www.npmjs.com/package/node-trello
const serverStartTime = new Date();
var serverHeader = "";
var httpLog = "";

// Create a simple server
const hostname = '0.0.0.0';
const port = 3333;

const server = http.createServer((req, res) => {
  if(req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    serverHeader = "Started: "+serverStartTime.toISOString()+"\n\n";
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
  httpLog = date.toISOString()+" - "+ toAdd + "\n" + httpLog; // Add it to the top.
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
    botTrello.get(`/1/boards/${newCard.idBoard}/cards/`, function(err, data) {
      if (err) throw err;

      var existingCard = null;
      data.forEach(function(card, array, index) { // Find if one with the same name exists
        if(card.name === newCard.name) existingCard = card; // Match up cards by name.
      });
      if(existingCard === null) { // Create the new card
        botTrello.post(`/1/cards/`, newCard, function(err, data) {
          if (err) throw err;
          httpLogAdd(`"${newCard.name}" created successfully`);
        });
      }
      else {
        if(existingCard.idList !== newCard.idList) { // Move card to the correct list and update to definition
          botTrello.put(`/1/cards/${existingCard.id}`, newCard, function(err, data) {
            if (err) throw err;
            httpLogAdd(`"${existingCard.name}" moved successfully`);
          });
        }
        else { // In this case, it's already there. Just comment.
          var comment = "Schedule hit again.";
          botTrello.post(`/1/cards/${existingCard.id}/actions/comments/`, {text: comment}, function(err, data) {
            if (err) throw err;
            httpLogAdd(`"${existingCard.name}" commented with "${comment}"`);
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
var tasksToDoListId = "57782b97434403f86849e905";
// Labels
var tasksScheduledLabelId = "57d8bb57412839bd591a61c5";

// Cards
// Relevant card parameters are defined according to Trello post method: https://developers.trello.com/v1.0/reference#cards-2

var tasksCards = [
  {
    name: "Pay Mortgage",
    desc: "**Schedule**: Monthly on the 25th at 6PM\n"+
          "\n"+
          "https://mypennymac.pennymacusa.com/\n"+
          "\n"+
          "Venmo request $1,460 from Katelyn\n",
    cronSchedule: "0 18 25 * *",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Input Utilities",
    desc: "**Schedule**: Monthly on the 1st at 6PM\n"+
    "\n"+
    "Input utility data into PostgreSQL",
    cronSchedule: "0 18 1 * *",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Pay Cell Phone",
    desc: "**Schedule**: Monthly on the 1st at 6PM\n"+
          "\n"+
          "$35 to Mom through PayPal:\n",
    cronSchedule: "0 18 1 * *",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Monthly Money Review",
    desc: "**Schedule**: Monthly on the 28th at 6PM\n"+
      "\n"+
      "Review your monthly spending in GnuCash",
    cronSchedule: "0 18 28 * *",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Brush Gracie's Teeth",
    desc: "**Schedule**: Weekly on Saturday at noon",
    cronSchedule: "0 12 * * 6",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  // {
  //   name: "Clean Quincy's Cage",
  //   desc: "**Schedule**: Weekly on Monday at 6PM",
  //   cronSchedule: "0 18 * * 1",
  //   idBoard: tasksBoardId,
  //   idList: tasksToDoListId,
  //   pos:"top",
  //   idLabels: [tasksScheduledLabelId]
  // },
  {
    name: "Take Out Trash",
    desc: "**Schedule**: Weekly on Monday at 6PM\n"+
      "\n"+
      "Take trash, recycling, and compost cans to the curb",
    cronSchedule: "0 18 * * 1",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Bring In Trash",
    desc: "**Schedule**: Weekly on Tuesday at 6PM\n"+
      "\n"+
      "Bring in trash, recycling, and compost cans from the curb",
    cronSchedule: "0 18 * * 2",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Water Indoor Plants",
    desc: "**Schedule**: Weekly on Tuesday at 6PM",
    cronSchedule: "0 18 * * 2",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Mow Lawn",
    desc: "**Schedule**: Every Thursday at 6PM from April through October",
    cronSchedule: "0 18 * 4-10 4",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Pool Maintenance",
    desc: "**Schedule**: Every Saturday at noon from May through October\n"+
      "\n"+
      "Perform pool testing, chemical treatments, straining, brushing, and vacuuming",
    cronSchedule: "0 12 * 5-10 6",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  // {
  //   name: "Meal Plan and Groceries",
  //   desc: "**Schedule**: Weekly on Sunday at noon\n"+
  //     "\n"+
  //     "Plan meals for the week and buy groceries",
  //   cronSchedule: "0 12 * * 0",
  //   idBoard: tasksBoardId,
  //   idList: tasksToDoListId,
  //   pos:"top",
  //   idLabels: [tasksScheduledLabelId]
  // },
  {
    name: "Water Backyard Garden",
    desc: "**Schedule**: Weekly on Sunday and Wednesday at 6PM from April through October\n"+
      "\n"+
      "Water garden near the pool and bamboo",
    cronSchedule: "0 18 * 4-10 0,3",
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  // {
  //   name: "Clean Bedroom",
  //   desc: "**Schedule**: Monthly on the 1st Saturday at noon\n"+
  //     "\n"+
  //     "Check the following and perform as needed:\n"+
  //     "\n"+
  //     "* Pick up clutter\n"+
  //     "* Dust\n"+
  //     "* Wash sheets\n"+
  //     "* Sweep/Vacuum",
  //   cronSchedule: "0 12 * * 6",
  //   dayRange: firstWeek,
  //   idBoard: tasksBoardId,
  //   idList: tasksToDoListId,
  //   pos:"top",
  //   idLabels: [tasksScheduledLabelId]
  // },
  // {
  //   name: "Clean Kitchen",
  //   desc: "**Schedule**: Monthly on the 2nd Saturday at noon\n"+
  //     "\n"+
  //     "Check the following and perform as needed:\n"+
  //     "\n"+
  //     "* Do dishes\n"+
  //     "* Wipe countertops\n"+
  //     "* Wipe cupboards\n"+
  //     "* Wipe/dust appliances\n"+
  //     "* Clean stovetop\n"+
  //     "* Clean microwave\n"+
  //     "* Clean sink\n"+
  //     "* Clean fridge\n"+
  //     "* Shake rug (outside)\n"+
  //     "* Sweep/Vacuum\n"+
  //     "* Mop",
  //   cronSchedule: "0 12 * * 6",
  //   dayRange: secondWeek,
  //   idBoard: tasksBoardId,
  //   idList: tasksToDoListId,
  //   pos:"top",
  //   idLabels: [tasksScheduledLabelId]
  // },
  {
    name: "Clean Bathrooms",
    desc: "**Schedule**: Monthly on the 3nd Saturday at noon\n"+
      "\n"+
      "Check the following and perform as needed:\n"+
      "\n"+
      "* Clean mirrors\n"+
      "* Clean tub\n"+
      "* Clean sinks\n"+
      "* Clean toilets\n"+
      "* Sweep/Vacuum\n"+
      "* Mop",
    cronSchedule: "0 12 * * 6",
    dayRange: thirdWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Clean Living Room",
    desc: "**Schedule**: Monthly on the 4th Saturday at noon\n"+
      "\n"+
      "Check the following and perform as needed:\n"+
      "\n"+
      "* Pick up clutter\n"+
      "* Dust\n"+
      "* Clean glass tables\n"+
      "* Sweep/Vacuum",
    cronSchedule: "0 12 * * 6",
    dayRange: fourthWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Clean Den",
    desc: "**Schedule**: Monthly on the 1st Saturday at noon\n"+
      "\n"+
      "Check the following and perform as needed:\n"+
      "\n"+
      "* Pick up clutter\n"+
      "* Dust\n"+
      "* Clean glass tables\n"+
      "* Sweep/Vacuum",
    cronSchedule: "0 12 * * 6",
    dayRange: firstWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  }
]
tasksCards.forEach( card => {
  cron.schedule(card.cronSchedule, function(){staticScheduleCardFunc(card);});
});

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
//      if(labels.indexOf(tasksScheduledLabelId) > -1) nodeCards.push(card); // If not included, indexOf returns -1
//    });
//    jsonfile.writeFile('/home/jay/dev/node.js/nodeCards.json', nodeCards, function (err) { // This writes the object to nodeCards.json
//      console.error(err);
//    });
//  });
//};
