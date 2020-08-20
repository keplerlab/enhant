FROM node:10-alpine
WORKDIR /usr/src/app
COPY package.json ${WORKDIR}
RUN npm install
EXPOSE 2000
CMD ["npm", "start"]
