#  Dockerfile for Node Express Backend

FROM node:16.13-alpine

# Create App Directory

WORKDIR /home/Devang/Desktop/Projects/Backend-Repo

# Install Dependencies
COPY package*.json ./

RUN yarn --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 5000

CMD ["yarn","start"]