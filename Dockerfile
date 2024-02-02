FROM node:16
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN ./node_modules/typescript/bin/tsc
EXPOSE 3000
CMD [ "node", "dist/index.js" ]
