
## Run

1. Install node
2. Update/clone from the git repository. Enter directory.
3. Install relevant modules: npm install
4. Start the process: node server.js

### Docker

Setup:

1. Install Docker
2. Pull down image from needleinajaystack/trello-bot

To run:
  sudo docker run -p 3333:3333 -d --restart=always needleinajaystack/trello-bot

To stop:
1. Get the Docker container id: sudo docker ps
2. Stop the container: sudo docker stop <container.id>


To build a Docker image:

1. Update/clone from the git repository. Enter directory.
2. Build the image: sudo docker build -t needleinajaystack/trello-bot .
3. Push the image: sudo docker push needleinajaystack/trello-bot:tagname
