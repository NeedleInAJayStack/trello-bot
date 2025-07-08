# Trello Bot

This is a simple service that creates/moves around Trello cards on specific schedules to help me run my life. Some of it's features:

- It can be configured to create/move cards on any cron schedule, in addition to "X week of the month".
- It will check (by card name) whether the card already exists on the board. If so, and in the To Do list, it will comment on it. If not in the To Do list, it will move it to the top of that list. Otherwise, it will create the card and place it at the top of the To Do list.
- It will the attributes of any matching card to reflect the values in the repo.

It's HIGHLY tailored to my particular needs and probably won't be all that valuable to anyone else.

## Run

1. Install node
2. Install relevant modules: `npm install`
3. Create a `.env` with the following vars:
  - `TRELLO_DEV_KEY`
  - `TRELLO_BOT_TOKEN`
4. Start the process: `node server.js`

### Docker

To run:
```zsh
docker-compose up -d
```
