FROM node:alpine

RUN mkdir -p /usr/src/js-boilerplate && chown -R node:node /usr/src/js-boilerplate

WORKDIR /usr/src/js-boilerplate

COPY package.json yarn.lock ./

RUN yarn install --pure-lockfile

COPY --chown=node:node . . 

EXPOSE 3000