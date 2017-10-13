FROM node:4-onbuild

RUN mkdir -p /usr/src/sqsSocketIo
WORKDIR /usr/src/sqsSocketIo

COPY . /usr/src/sqsSocketIo
RUN npm install

EXPOSE 3000
EXPOSE 8889
ENTRYPOINT ["npm", "start"]
