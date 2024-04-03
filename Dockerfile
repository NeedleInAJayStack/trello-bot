# Follows tutorial here: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Set timezone to Denver (https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes)
ENV TZ=America/Denver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install && \
    npm install -g typescript

# Bundle app source
COPY . .

RUN tsc

EXPOSE 3333

CMD [ "node", "./dist/server.js" ]
