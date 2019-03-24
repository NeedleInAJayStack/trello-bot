# Follows tutorial here: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Set timezone to Denver (https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes)
ENV TZ=America/Denver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
