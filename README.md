

### Docker

To build a Docker image:

1. Change into code directory (that contains Dockerfile)
2. Run: sudo docker build -t needleinajaystack/trello-bot .


To run with Docker:

1. Install Docker
2. Pull down image from needleinajaystack/trello-bot
3. Run: docker run -p 3000:3000 -d needleinajaystack/trello-bot
