import http = require('http')
import cron = require('node-cron') // Doc here: https://www.npmjs.com/package/node-cron
import axios = require('axios')

// HTTP SERVER
const serverStartTime = new Date()
let httpLog = 'Started: ' + serverStartTime.toISOString() + '\n\n'

// Create a simple server
const hostname = '0.0.0.0'
const port = 3333

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(httpLog)
  } else {
    res.statusCode = 405
  }
})

server.listen(port, hostname, () => {
  console.log('Server running at http://' + hostname + ':' + port + '/')
})

// Adds the specified message to the top of the http log.
const httpLogAdd = (toAdd: string): void => {
  const date = new Date()
  const log = date.toISOString() + ' - ' + toAdd + '\n'
  console.log(log)
  httpLog = log + httpLog // Add it to the top.
}

// TRELLO
const trelloDevKey = process.env.TRELLO_DEV_KEY
if (trelloDevKey === undefined || trelloDevKey === '') {
  throw new Error('TRELLO_DEV_KEY is not set.')
}
const jaysTrelloBotToken = process.env.TRELLO_BOT_TOKEN // This is the bot's token.
if (jaysTrelloBotToken === undefined || jaysTrelloBotToken === '') {
  throw new Error('TRELLO_BOT_TOKEN is not set.')
}

interface Card {
  id: string
  name: string
  idList: string[]
}

const httpClient = axios.default
const axoisConfig = {
  params: {
    key: trelloDevKey,
    token: jaysTrelloBotToken
  }
}

// This function tries to find the card to be created by name. If it doesn't exist, it creates it. If it does, but in
// a different list, it moves it, and if it exists in the same list, it is commented on.
const staticScheduleCardFunc = async (newCard): Promise<void> => {
  const date = new Date()
  if (newCard.dayRange === undefined || newCard.dayRange.indexOf(date.getDate()) > -1) { // Only proceed if dayRange is undefined or today is within the range.
    const cardsRes = await httpClient.get(`https://api.trello.com/1/boards/${newCard.idBoard}/cards/`, axoisConfig)
    const cards: Card[] = cardsRes.data

    let existingCard: Card | undefined
    cards.forEach(function (card) { // Find if one with the same name exists
      if (card.name === newCard.name) existingCard = card // Match up cards by name.
    })
    if (existingCard != null) {
      const cardName = existingCard.name
      if (existingCard.idList !== newCard.idList) { // Move card to the correct list and update to definition
        await httpClient.put(`https://api.trello.com/1/cards/${existingCard.id}`, newCard, axoisConfig)
        httpLogAdd(`"${cardName}" moved successfully`)
      } else { // In this case, it's already there. Just comment.
        const comment = 'Schedule hit again.'
        await httpClient.post(`https://api.trello.com/1/cards/${existingCard.id}/actions/comments/`, { text: comment }, axoisConfig)
        httpLogAdd(`"${cardName}" commented with "${comment}"`)
      }
    } else { // Create the new card
      await httpClient.post('https://api.trello.com/1/cards/', newCard, axoisConfig)
      httpLogAdd(`"${newCard.name}" created successfully`)
    }
  }
}

// Monthly date range rules. According to these rules, weeks will occasionally be skipped.
const firstWeek = [1, 2, 3, 4, 5, 6, 7]
// const secondWeek = [8, 9, 10, 11, 12, 13, 14]
const thirdWeek = [15, 16, 17, 18, 19, 20, 21]
const fourthWeek = [22, 23, 24, 25, 26, 27, 28]
// const firstAndThirdWeek = [1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 21]
// const secondAndFourthWeek = [8, 9, 10, 11, 12, 13, 14, 22, 23, 24, 25, 26, 27, 28]

// TASKS
// Board
const tasksBoardId = '649fc332c93c2d7139afa8c0'
// List
const tasksToDoListId = '649fc332c93c2d7139afa8c7'
// Labels
const tasksScheduledLabelId = '649fc333c93c2d7139afab7f'

// Cards
// Relevant card parameters are defined according to Trello post method: https://developers.trello.com/v1.0/reference#cards-2

const houseCards = [
  {
    name: 'Take Out Trash',
    desc: '**Schedule**: Weekly on Monday at 6PM\n' +
      '\n' +
      'Take trash, recycling, and compost cans to the curb',
    cronSchedule: '0 18 * * 0',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Water Indoor Plants',
    desc: '**Schedule**: Weekly on Tuesday at 6PM',
    cronSchedule: '0 18 * * 2',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Clean Bathrooms',
    desc: '**Schedule**: Monthly on the 3nd Saturday at noon\n' +
      '\n' +
      'Check the following and perform as needed:\n' +
      '\n' +
      '* Clean mirrors\n' +
      '* Clean tub\n' +
      '* Clean sinks\n' +
      '* Clean toilets\n' +
      '* Sweep/Vacuum\n' +
      '* Mop',
    cronSchedule: '0 12 * * 6',
    dayRange: thirdWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Clean Living Room',
    desc: '**Schedule**: Monthly on the 4th Saturday at noon\n' +
      '\n' +
      'Check the following and perform as needed:\n' +
      '\n' +
      '* Pick up clutter\n' +
      '* Dust\n' +
      '* Clean glass tables\n' +
      '* Sweep/Vacuum',
    cronSchedule: '0 12 * * 6',
    dayRange: fourthWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Clean Den',
    desc: '**Schedule**: Monthly on the 1st Saturday at noon\n' +
      '\n' +
      'Check the following and perform as needed:\n' +
      '\n' +
      '* Pick up clutter\n' +
      '* Dust\n' +
      '* Clean glass tables\n' +
      '* Sweep/Vacuum',
    cronSchedule: '0 12 * * 6',
    dayRange: firstWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  }
]

const yardCards = [
  {
    name: 'Mow Lawn',
    desc: '**Schedule**: Every Saturday at 8AM from April through October',
    cronSchedule: '0 8 * 4-10 6',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Pool Maintenance',
    desc: '**Schedule**: Every Sunday at 7PM from May through October\n' +
      '\n' +
      'Perform pool testing, chemical treatments, straining, brushing, and vacuuming',
    cronSchedule: '0 19 * 5-10 7',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Water Backyard Garden',
    desc: '**Schedule**: Weekly on Sunday and Wednesday at 6PM from April through October\n' +
      '\n' +
      'Water garden near the pool and bamboo',
    cronSchedule: '0 18 * 4-10 0,3',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Check Sprinklers",
    desc: "**Schedule**: Monthly on the 1st Sunday at noon from April through October",
    cronSchedule: '0 12 * 4-10 0',
    dayRange: firstWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  }
]

const petCards = [
  {
    name: "Brush Gracie's Teeth",
    desc: '**Schedule**: Weekly on Saturday at noon',
    cronSchedule: '0 12 * * 6',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: "Clean Quincy's Cage",
    desc: "**Schedule**: Monthly on the 1st Saturday at noon",
    cronSchedule: '0 12 * * 6',
    dayRange: firstWeek,
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos:"top",
    idLabels: [tasksScheduledLabelId]
  }
]

const miscCards = [
  {
    name: 'Input Utilities',
    desc: '**Schedule**: Monthly on the 1st at 6PM\n' +
    '\n' +
    'Input utility data into PostgreSQL',
    cronSchedule: '0 18 1 * *',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Pay Cell Phone',
    desc: '**Schedule**: Monthly on the 1st at 6PM\n' +
          '\n' +
          '$35 to Mom through PayPal\n',
    cronSchedule: '0 18 1 * *',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  },
  {
    name: 'Monthly Money Review',
    desc: '**Schedule**: Monthly on the 28th at 6PM\n' +
      '\n' +
      'Review your monthly spending in GnuCash\n' +
      '\n' +
      '* Pay Katelyn for car insurance ($131.36/month)\n' +
      '* Pay Katelyn for shared expenses\n' +
      '* Charge Katelyn for health insurance ($100/paycheck)\n' +
      '* Charge Katelyn for mortgage\n',
    cronSchedule: '0 18 28 * *',
    idBoard: tasksBoardId,
    idList: tasksToDoListId,
    pos: 'top',
    idLabels: [tasksScheduledLabelId]
  }
]

const allCards = [
  ...houseCards,
  ...yardCards,
  ...petCards,
  ...miscCards
]
allCards.forEach(card => {
  cron.schedule(card.cronSchedule, async () => {
    try {
      await staticScheduleCardFunc(card)
    } catch (error) {
      console.error(error)
    }
  })
})
