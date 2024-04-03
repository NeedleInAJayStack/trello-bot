import Trello = require('node-trello') // Doc here: https://www.npmjs.com/package/node-trello

const trelloDevKey = process.env.TRELLO_DEV_KEY
const jaysTrelloBotToken = process.env.TRELLO_BOT_TOKEN // This is the bot's token.
const botTrello = new Trello(trelloDevKey, jaysTrelloBotToken) // Connect to Trello

// // Gets the boards of the user.
botTrello.get('/1/members/jaysuserbot/boards', function (err, data) {
  if (err != null) throw err
  console.log(data)
})

// // Gets the lists of the board.
botTrello.get('/1/boards/649fc332c93c2d7139afa8c0/lists', function (err, data) {
  if (err != null) throw err
  console.log(data)
})

// // Gets the labels of the board.
botTrello.get('/1/boards/649fc332c93c2d7139afa8c0/labels', function (err, data) {
  if (err != null) throw err
  console.log(data)
})
