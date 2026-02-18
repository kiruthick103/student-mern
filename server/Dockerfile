# Use Node.js alpine base image for a small footprint
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Create data directory for local JSON database if it doesn't exist
RUN mkdir -p data

EXPOSE 5000

CMD [ "npm", "start" ]
