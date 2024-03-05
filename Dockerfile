##### Dockerfile #####
FROM node:14.21.3

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN apt-get update && apt-get install -y cmake
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

EXPOSE 3000
CMD [ "node", "index.js" ]