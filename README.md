
## Run

1. Install node
2. Update/clone from the git repository. Enter directory.
3. Install relevant modules: npm install
4. Start the process: node server.js

### Docker

To run with Docker:

1. Install Docker
2. Pull down image from needleinajaystack/trello-bot
3. Run: sudo docker run -p 3000:3000 -d --restart=always needleinajaystack/trello-bot


To build a Docker image:

1. Update/clone from the git repository. Enter directory.
2. Build the image: sudo docker build -t needleinajaystack/trello-bot .
3. Push the image: sudo docker push needleinajaystack/trello-bot:tagname
