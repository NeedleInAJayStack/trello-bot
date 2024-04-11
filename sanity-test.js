// import Trello = require('node-trello') // Doc here: https://www.npmjs.com/package/node-trello
// import type { Card } from './server.ts'
import Trello from "node-trello";
import https from 'https';

// TRELLO
const trelloDevKey = process.env.TRELLO_DEV_KEY
const jaysTrelloBotToken = process.env.TRELLO_BOT_TOKEN // This is the bot's token.
const botTrello = new Trello(trelloDevKey, jaysTrelloBotToken) // Connect to Trello

botTrello.get(
  '/1/members/me',
  // function (err: Error | undefined, data: Card[]) {
  function (err, data) {
    if (err != null) throw err
    console.log(data)
  }
)

// let url = new URL(`https://api.trello.com/1/boards/649fc332c93c2d7139afa8c0/cards/?key=${trelloDevKey}&token=${jaysTrelloBotToken}`)
// let req = https.request(
//   url,
//   function (res) {
//     console.log('statusCode:', res.statusCode);
//     console.log('headers:', res.headers);
//     res.on('data', (d) => {
//       process.stdout.write(d);
//     });
//   }
// )
// req.on('error', (e) => {
//   console.error(e);
// });
// req.end();
